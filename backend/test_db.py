import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flashcards.settings_prod')
django.setup()

from api.models import Card, Deck

print("Checking all cards for formatting issues...")
issues = []

for card in Card.objects.all():
    card_issues = []
    q = card.question or ""
    a = card.answer or ""

    if q.count('[') != q.count(']'):
        card_issues.append("question: unbalanced brackets")
    if q.count('{') != q.count('}'):
        card_issues.append("question: unbalanced braces")
    if not q.strip():
        card_issues.append("question: empty")

    if a.count('[') != a.count(']'):
        card_issues.append("answer: unbalanced brackets")
    if a.count('{') != a.count('}'):
        card_issues.append("answer: unbalanced braces")
    if not a.strip():
        card_issues.append("answer: empty")

    if card_issues:
        issues.append({
            "id": card.id,
            "deck": card.deck.title,
            "q": q[:40],
            "issues": card_issues
        })

if issues:
    print(f"Found {len(issues)} cards with issues:")
    for i in issues:
        print(f"Card {i['id']} in '{i['deck']}': {i['q']}...")
        for iss in i['issues']:
            print(f"  - {iss}")
else:
    print("No formatting issues found!")

print(f"Total cards: {Card.objects.count()}, Total decks: {Deck.objects.count()}")
