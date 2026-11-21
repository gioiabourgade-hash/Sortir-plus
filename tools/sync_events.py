#!/usr/bin/env python3
"""Synchronise les événements publics de Bordeaux Métropole via l'API OpenAgenda v2.
Nécessite OPENAGENDA_PUBLIC_KEY dans les secrets GitHub Actions.
N'écrase jamais les événements ajoutés manuellement à evenements.json.
"""
import datetime as dt
import json
import os
import pathlib
import re
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
AGENDA_UID = '83549053'  # Agenda Bordeaux Métropole (lien RSS officiel)
OUT = ROOT / 'evenements-auto.json'


def plain(value):
    if isinstance(value, dict):
        return value.get('fr') or value.get('en') or next((v for v in value.values() if isinstance(v, str)), '')
    return value if isinstance(value, str) else ''


def iso_date(value):
    if isinstance(value, dict):
        value = value.get('begin') or value.get('end')
    if not isinstance(value, str):
        return ''
    match = re.match(r'^\d{4}-\d{2}-\d{2}', value)
    return match.group(0) if match else ''


def transform(e, today):
    title = plain(e.get('title')).strip()
    loc = e.get('location') or {}
    if not isinstance(loc, dict):
        loc = {}
    city = plain(loc.get('city')).strip()
    place = plain(loc.get('name')).strip() or city
    # Les événements sans lieu local identifiable sont écartés.
    if not title or not place:
        return None
    times = e.get('timings') or []
    starts = [iso_date(t.get('begin')) for t in times if isinstance(t, dict)]
    ends = [iso_date(t.get('end') or t.get('begin')) for t in times if isinstance(t, dict)]
    starts = [x for x in starts if x]
    ends = [x for x in ends if x]
    start = min(starts) if starts else iso_date(e.get('firstTiming'))
    end = max(ends) if ends else iso_date(e.get('lastTiming'))
    if not start or not end or end < today:
        return None
    link = e.get('canonicalUrl') or e.get('url') or ''
    if not isinstance(link, str) or not link.startswith('https://'):
        link = f"https://openagenda.com/fr/bordeaux-metropole/events/{e.get('slug', '')}"
    description = re.sub(r'<[^>]+>', ' ', plain(e.get('description')))
    description = re.sub(r'\s+', ' ', description).strip()[:260]
    rights = e.get('rights') or {}
    licensor = rights.get('licensor') or {}
    credit = plain(licensor.get('name')) if isinstance(licensor, dict) else ''
    # Les images ne sont pas recopiées : droits et crédits à vérifier au cas par cas.
    return {
        'sourceId': 'openagenda-' + str(e.get('uid', '')),
        'title': title,
        'start': start,
        'end': end,
        'category': 'Agenda local',
        'place': place,
        'description': description or 'Consultez le programme et les informations pratiques auprès de l’organisateur.',
        'bookingUrl': link,
        'source': link,
        'credit': credit or 'OpenAgenda · Bordeaux Métropole',
        'updatedAt': str(e.get('updatedAt') or ''),
        'license': str(rights.get('license') or ''),
    }


def sync():
    key = os.getenv('OPENAGENDA_PUBLIC_KEY', '').strip()
    if not key:
        raise SystemExit('Secret OPENAGENDA_PUBLIC_KEY manquant. Ajouter une clé publique OpenAgenda dans GitHub > Settings > Secrets and variables > Actions.')
    if not key.startswith('oa_pk_'):
        raise SystemExit('Utiliser une clé PUBLIQUE OpenAgenda (préfixe oa_pk_), jamais une clé secrète.')
    url = f'https://api.openagenda.com/v2/agendas/{AGENDA_UID}/events?relative%5B%5D=current&relative%5B%5D=upcoming&size=100&monolingual=fr'
    req = urllib.request.Request(url, headers={'key': key, 'Accept': 'application/json', 'User-Agent': 'SORTIRplus-events/1.0'})
    with urllib.request.urlopen(req, timeout=35) as response:
        payload = json.load(response)
    if not isinstance(payload.get('events'), list):
        raise ValueError('Réponse OpenAgenda inattendue : catalogue inchangé.')
    today = dt.datetime.now(dt.timezone(dt.timedelta(hours=1))).date().isoformat()
    result = []
    for e in payload['events']:
        if not isinstance(e, dict):
            continue
        item = transform(e, today)
        if item:
            result.append(item)
    if not result:
        raise ValueError('Aucun événement exploitable : le catalogue existant est conservé.')
    result.sort(key=lambda e: (e['start'], e['title']))
    OUT.write_text(json.dumps(result[:100], ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{len(result[:100])} événements mis à jour.')


if __name__ == '__main__':
    sync()
