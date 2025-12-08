import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flashcards.settings_prod')
django.setup()

from api.models import Card

# Cards to fix - extracted the real content from the corrupted data
fixes = [
    {
        "id": 256,
        "question": "State one disadvantage of gas and air (Entonox).",
        "answer": "It may cause dizziness or nausea and does not remove all pain."
    },
    {
        "id": 289,
        "question": "Explain how intellectual property (IP) and licences are addressed.",
        "answer": "The architect retains copyright in drawings/models and grants the client a licence to use them for the project, typically conditional on full fee payment."
    },
    {
        "id": 313,
        "question": "What is one misconception about Commedia Dell'Arte?",
        "answer": "That it was fully scripted—it was mostly improvised."
    }
]

print("Fixing corrupted cards...\n")

for fix in fixes:
    card = Card.objects.get(id=fix["id"])
    print(f"Card {fix['id']} in '{card.deck.title}':")
    print(f"  OLD Q: {card.question}")
    print(f"  NEW Q: {fix['question']}")
    print(f"  OLD A: {card.answer[:60]}...")
    print(f"  NEW A: {fix['answer']}")

    card.question = fix["question"]
    card.answer = fix["answer"]
    card.save()
    print(f"  FIXED!\n")

print("All cards fixed. Running verification...")

# Verify
for fix in fixes:
    card = Card.objects.get(id=fix["id"])
    q_ok = card.question == fix["question"]
    a_ok = card.answer == fix["answer"]
    print(f"Card {fix['id']}: Question OK: {q_ok}, Answer OK: {a_ok}")

print("\nDone!")
