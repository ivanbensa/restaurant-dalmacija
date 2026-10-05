# Restaurant Dalmacija — Design B

Završena faza 2 vizuelnog redizajna, 5. oktobar 2026. Osnova je `restaurant-dalmacija-fixed`. Originalni projekat i prethodna verzija nisu menjani.

## Pokretanje

Otvorite ovaj folder kroz Live Server ili drugi lokalni HTTP server. Na primer, u folderu projekta:

```sh
python3 -m http.server 8000
```

Otvorite `http://localhost:8000/`. Potreban je HTTP/HTTPS zbog učitavanja JSON-a; direktno otvaranje HTML-a preko `file://` nije podržano. Za hosting prenesite četiri HTML fajla i foldere `css`, `js`, `data`, `locales`, `images`, `fonts` i `vendor`. Nema novog frameworka, instalacije paketa, bundlera ili backenda.

## Šta je promenjeno

- Lokalno učitani Inter za tekst, Playfair Display za naslove i Great Vibes za logo i kratke ukrasne natpise, uz DE/HR podršku.
- Topla krem podloga sa vrlo blagom teksturom papira, tamnoplavi naslovi, crveni akcenti i tanke razdelne linije.
- Kompaktnije zaglavlje sa podvučenom aktivnom stranicom. Dugme za telefonsku rezervaciju pojavljuje se od 1400 px; mobilna navigacija i izbor jezika ostaju.
- Niži hero koristi postojeću fotografiju stvarnog enterijera (`welcome-dalmacija.webp`), sa čitljivim naslovom i dva dugmeta. Nije dodata generisana fotografija restorana.
- Uvod ima urednički raspored, kratak script natpis, fotografiju jela, maslinu i diskretnu skicu obale. Svetla traka sa ikonama pomerena je uz uvod.
- Tri kategorije specijaliteta imaju različite postojeće fotografije, tanje okvire i direktne linkove ka kategorijama jelovnika.
- Jelovnik, pića i galerija dobili su usklađene naslove, toplije površine i diskretan obalni motiv. Kontakt, mapa i tamnoplavi footer su vizuelno doterani.
- Mobilni prikaz uklanja velike dekoracije, slaže hero dugmad i zadržava čitljive cene/količine. Animacije poštuju `prefers-reduced-motion`.
- Galerijska fotografija sa vodenim žigom zamenjena je postojećom `images/specialties/fish.webp`. Tri označene stock fotografije (`gallery/fish.jpg`, `grill.jpg`, `gulash.jpg`) isključene su iz ove kopije, bez uklanjanja žigova sa samih slika.

## Šta je sačuvano

Svih pet JS fajlova i oba data JSON-a identični su verziji `restaurant-dalmacija-fixed`. Cene, alergeni, ID-jevi, jela, pića, logika jezika i ponašanje galerije nisu menjani. U locale fajlove dodata su samo tri kratka dizajnerska natpisa; ispravljen je opis fotografije hobotnice.

## Provere

- Sve četiri stranice × DE/HR/EN × 320, 375, 390, 768, 1024, 1200, 1440 i 1920 px: **96 kombinacija**, bez horizontalnog preliva ili duplih ID-jeva.
- Jelovnik: **81 jelo, 11 kategorija, jedan notes blok**. Pića: **78 pića, 11 kategorija, jedan notes blok**. Po jedna aktivna kategorija.
- Sticky kategorije i novi linkovi sa specijaliteta: izabrani naslov ostaje ispod trake, sa približno 16 px razmaka.
- Mobilno zaglavlje i jezički meni, pamćenje jezika nakon ponovnog učitavanja, skip link i vidljivi fokusi.
- Svih šest galerijskih slajdova, otvaranje tastaturom, strelica za sledeću sliku, Escape i povratak fokusa na polaznu fotografiju.
- Lokalni fontovi/dekor, putanje, anchor veze, prevodivi elementi i SVG validnost. Nema zabeleženih browser console grešaka ili upozorenja.
- Provere su sprovedene u lokalnom browseru sa promenom viewporta; fizički telefoni i produkcioni hosting nisu bili predmet testiranja.

## Novi asseti

Originalni dekorativni SVG crteži, bez preuzetih ilustracija:

- `images/decor/paper-grain.svg` — diskretna tekstura papira.
- `images/decor/olive-branch.svg` — maslinova grančica.
- `images/decor/dalmatian-coast.svg` — zamišljeni jadranski gradić i luka; ne predstavlja lokaciju restorana.

Lokalni fontovi sa zvaničnih Google Fonts izvora:

- `fonts/inter-latin.woff2` i `inter-latin-ext.woff2`
- `fonts/playfair-display-latin.woff2` i `playfair-display-latin-ext.woff2`
- `fonts/great-vibes-latin.woff2` i `great-vibes-latin-ext.woff2`
- `css/fonts.css`, tri OFL licence i `fonts/README.md` sa izvorima i kontrolnim sumama.

Detalji originalnog dekora su u `images/decor/README.md`. Nove bitmap fotografije nisu dodavane.

## Fotografije od vlasnika

Sajt nema prazne foto-placeholdere. Za konačnu autentičnu prezentaciju preporučuju se:

1. Široka fotografija stvarnog enterijera ili terase u toplom večernjem svetlu, najmanje 2400 px širine, sa mirnijom levom stranom za hero tekst. Trenutno je iskorišćena postojeća fotografija enterijera.
2. Tri originalne fotografije sopstvenih jela: riba, roštilj i dalmatinski specijalitet. Trenutne lokalne slike ostaju dok vlasnik ne potvrdi prava i reprezentativnost.
3. Novije fotografije terase, sale i osoblja u većoj rezoluciji, uz potrebne dozvole za objavu. Postojeće fotografije se koriste u galeriji.

## Pre javne objave — otvorene stavke iz faze 1

- Vlasnik treba da potvrdi sporne podatke jelovnika (npr. ID 75 i 117), alergene/aditive i nedoslednosti opisa pića. Ova faza ih nije menjala.
- Potrebni su potvrđeni podaci operatera za Impressum, podaci o hostingu/servisima za Datenschutz, produkcioni domen i slika za deljenje. Pravni tekstovi nisu izmišljani.
- Postojeća Google Maps integracija ostaje; način učitavanja uskladiti sa potvrđenim obaveštenjem o privatnosti.
