import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flashcards.settings_prod')
django.setup()

from api.models import Card

card_ids = [256, 289, 313]

print("Inspecting cards with issues:\n")
print("=" * 80)

for card_id in card_ids:
    card = Card.objects.get(id=card_id)
    print(f"\nCard ID: {card_id}")
    print(f"Deck: {card.deck.title}")
    print(f"Question: {card.question}")
    print(f"Answer: {card.answer}")
    print(f"\nAnswer braces count: {{ = {card.answer.count('{')}, }} = {card.answer.count('}')}")
    print("=" * 80)
