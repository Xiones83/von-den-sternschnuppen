# Projektplan: von den Sternschnuppen

**Kundin:** Marie Christin Knorr
**E-Mail:** knorr.marie94@gmail.com
**Zwingername:** von den Sternschnuppen
**Domain:** von-den-sternschnuppen.de (geplant)

---

## Tech-Stack
- **Frontend:** HTML / CSS / JavaScript (kein Framework)
- **Hosting:** Netlify (kostenlos) — ermöglicht Formulare + Serverless Functions
- **Images:** Cloudinary (kostenlos, 25 GB) — Admin-Upload ohne Backend
- **Repo:** GitHub → `von-den-sternschnuppen`
- **E-Mail-Versand:** Formspree (kostenlos, 50 Einsendungen/Monat)
- **KI-Filterung (optional):** Netlify Function + Claude API

---

## Seiten / Sektionen

| # | Sektion | Status |
|---|---------|--------|
| 1 | Hero / Startbereich | ⬜ offen |
| 2 | Aktueller Wurf / Neuigkeiten (Admin editierbar) | ⬜ offen |
| 3 | Rasseinfo (Platzhalter, Rasse noch offen) | ⬜ offen |
| 4 | Ablauf & Bedingungen | ⬜ offen |
| 5 | Kosten (Platzhalter) | ⬜ offen |
| 6 | Galerie (Admin-Upload via Cloudinary) | ⬜ offen |
| 7 | Kontakt + Fragebogen → E-Mail an Marie | ⬜ offen |
| 8 | FAQ-Chatbot (regelbasiert, erweiterbar) | ⬜ offen |

---

## Features im Detail

### Galerie
- Öffentliche Foto-Galerie
- Passwortgeschützter Admin-Bereich
- Upload via Cloudinary Widget (direkt im Browser, kein Server nötig)
- Admin kann Bilder hinzufügen / entfernen

### Aktuell / Neuigkeiten
- Admin kann Text + Bilder zum aktuellen Wurf einstellen
- **"In Galerie verschieben"**-Button: Verschiebt Bilder per Klick in die Hauptgalerie
- Daten werden in Cloudinary + JSON-Struktur verwaltet

### Kontaktformular + Fragebogen
Pflichtfelder:
- Name, E-Mail, Telefon
- Erfahrung mit Hunden
- Wohnsituation (Haus/Wohnung, Garten?)
- Haushaltsmitglieder / Kinder?
- Wie viele Stunden täglich allein?
- Warum diese Rasse?
- Vorstellungen / Wünsche
- Einverständnis mit Besuchsrecht des Züchters

Versand: Formspree → E-Mail direkt an Marie

### KI-Filterung (optional, Phase 2)
- Netlify Serverless Function
- Claude API bewertet Fragebogen-Antworten
- **Ablehnung** bei klar unpassenden Antworten (keine Weiterleitung)
- **Weiterleitung** bei allen anderen (auch bei Unsicherheit)
- Benötigt: Claude API-Key (ca. 0,01 € pro Anfrage)

### FAQ-Chatbot
- Regelbasiert (kein API-Key)
- Themen: Rasse, Ablauf, Kosten, Bedingungen, Kontakt
- Platzhalter-FAQs, leicht erweiterbar per JSON

---

## Noch offen (vom Kunden)
- [ ] Hunderasse
- [ ] Fotos (eigene)
- [ ] Preise
- [ ] FAQ-Inhalte
- [ ] Ablauf & Bedingungen (Text)
- [ ] Cloudinary-Account anlegen (oder wir richten ein)
- [ ] Formspree-Account anlegen (oder wir richten ein)
- [ ] GitHub-Konto vorhanden?
- [ ] Netlify-Account anlegen

---

## Domain
- **Empfehlung:** `von-den-sternschnuppen.de` bei IONOS (~5 €/Jahr)
- Über Netlify DNS mit Hosting verbinden (kostenlos)
