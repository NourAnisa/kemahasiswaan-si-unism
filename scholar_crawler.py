from scholarly import scholarly
from typing import List, Dict

def get_publications(scholar_id: str) -> List[Dict]:
    """
    Crawling publikasi dari Google Scholar berdasarkan ID profil
    :param scholar_id: Google Scholar ID (misal: 'xJaxiEEAAAAJ')
    :return: List of publication dictionaries
    """
    try:
        author = scholarly.search_author_id(scholar_id)
        author_filled = scholarly.fill(author, sections=["publications"])

        publications = []
        for pub in author_filled.get("publications", []):
            pub_filled = scholarly.fill(pub)
            publications.append({
                "title": pub_filled.get("bib", {}).get("title", "Unknown"),
                "journal": pub_filled.get("bib", {}).get("venue", "Unknown"),
                "year": int(pub_filled.get("bib", {}).get("pub_year", 0)),
                "citations": pub_filled.get("num_citations", 0)
            })
        return publications

    except Exception as e:
        print(f"Error while fetching publications: {e}")
        return []
