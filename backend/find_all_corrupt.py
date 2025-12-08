import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flashcards.settings_prod')
django.setup()

from api.models import Card

print("Finding all corrupted cards...\n")
corrupt_cards = []

for card in Card.objects.all():
    q = card.question or ""
    a = card.answer or ""

    is_corrupt = False
    reasons = []

    # Check for JSON fragment patterns in question
    if q.startswith('": "') or q.startswith('"question"'):
        is_corrupt = True
        reasons.append("question starts with JSON fragment")

    # Very short/truncated questions (less than 10 chars and doesn't end with ?)
    if len(q.strip()) < 10 and not q.strip().endswith('?'):
        is_corrupt = True
        reasons.append(f"question too short: '{q}'")

    # Check for JSON fragment patterns in answer
    if a.startswith('": "') or a.startswith('"answer"'):
        is_corrupt = True
        reasons.append("answer starts with JSON fragment")

    # Answer contains JSON structure
    if '"question"' in a or '"answer"' in a:
        is_corrupt = True
        reasons.append("answer contains JSON keys")

    # Unbalanced braces
    if q.count('{') != q.count('}') or a.count('{') != a.count('}'):
        is_corrupt = True
        reasons.append("unbalanced braces")

    if is_corrupt:
        corrupt_cards.append({
            "id": card.id,
            "deck_id": card.deck.id,
            "deck": card.deck.title,
            "question": q,
            "answer": a,
            "reasons": reasons
        })

print(f"Found {len(corrupt_cards)} corrupted cards:\n")
print("=" * 80)

for card in corrupt_cards:
    print(f"Card ID: {card['id']} (Deck ID: {card['deck_id']})")
    print(f"Deck: {card['deck']}")
    print(f"Question: {card['question'][:100]}")
    print(f"Answer: {card['answer'][:100]}")
    print(f"Reasons: {card['reasons']}")
    print("-" * 80)

# Group by deck
decks_affected = {}
for card in corrupt_cards:
    deck_name = card['deck']
    if deck_name not in decks_affected:
        decks_affected[deck_name] = []
    decks_affected[deck_name].append(card['id'])

print(f"\n\nSummary by deck:")
for deck, card_ids in decks_affected.items():
    print(f"  {deck}: {len(card_ids)} corrupt cards (IDs: {card_ids})")

print(f"\nTotal: {len(corrupt_cards)} corrupt cards across {len(decks_affected)} decks")
print(f"Total cards in database: {Card.objects.count()}")
