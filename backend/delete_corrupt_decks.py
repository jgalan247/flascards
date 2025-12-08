import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flashcards.settings_prod')
django.setup()

from api.models import Card, Deck

# The 4 decks with corrupted cards
deck_names = [
    "Labour and birth and pain relief  - Year 10",
    "Architects Agreement for building design - Year 11",
    "Commedia Dell Arte - Year 8",
    "Global Biomes - Year 11"
]

print("Deleting corrupted decks...\n")

for deck_name in deck_names:
    try:
        deck = Deck.objects.get(title=deck_name)
        card_count = deck.cards.count()
        deck_id = deck.id

        # Delete the deck (cards will be deleted via CASCADE)
        deck.delete()

        print(f"Deleted: '{deck_name}'")
        print(f"  - Deck ID: {deck_id}")
        print(f"  - Cards removed: {card_count}")
        print()
    except Deck.DoesNotExist:
        print(f"Not found: '{deck_name}'")
        print()

print("=" * 60)
print("Done!")
print(f"Remaining decks: {Deck.objects.count()}")
print(f"Remaining cards: {Card.objects.count()}")
