import { NextRequest, NextResponse } from 'next/server';

interface BookRecommendation {
  id: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  reason: string;
  coverUrl?: string;
  amazonUrl?: string;
  rating: number;
}

// Music genre to book genre mapping
const genreMapping: Record<string, string[]> = {
  // Pop music genres
  'pop': ['contemporary fiction', 'romance', 'young adult', 'chick lit'],
  'electropop': ['science fiction', 'dystopian', 'contemporary fiction'],
  'dance pop': ['romance', 'contemporary fiction', 'young adult'],
  'teen pop': ['young adult', 'coming of age', 'romance'],
  
  // Rock genres
  'rock': ['literary fiction', 'adventure', 'thriller'],
  'indie rock': ['literary fiction', 'contemporary fiction', 'indie literature'],
  'alternative rock': ['dystopian', 'literary fiction', 'dark fiction'],
  'classic rock': ['historical fiction', 'adventure', 'biography'],
  
  // Electronic genres
  'electronic': ['science fiction', 'cyberpunk', 'futuristic'],
  'ambient': ['philosophy', 'meditation', 'literary fiction'],
  'techno': ['science fiction', 'thriller', 'cyberpunk'],
  
  // Hip-hop/R&B
  'hip hop': ['urban fiction', 'social commentary', 'biography'],
  'r&b': ['romance', 'contemporary fiction', 'drama'],
  'rap': ['urban fiction', 'social issues', 'biography'],
  
  // Folk/Acoustic
  'folk': ['historical fiction', 'literary fiction', 'nature writing'],
  'acoustic': ['poetry', 'literary fiction', 'memoir'],
  'singer-songwriter': ['memoir', 'poetry', 'literary fiction'],
  
  // Jazz/Blues
  'jazz': ['historical fiction', 'biography', 'literary fiction'],
  'blues': ['historical fiction', 'drama', 'southern fiction'],
  
  // Classical
  'classical': ['philosophy', 'historical fiction', 'literary classics'],
  
  // Country
  'country': ['southern fiction', 'family saga', 'rural fiction'],
  
  // Metal
  'metal': ['fantasy', 'dark fantasy', 'horror'],
  'heavy metal': ['fantasy', 'horror', 'mythology'],
  
  // Alternative/Indie
  'indie': ['indie literature', 'contemporary fiction', 'literary fiction'],
  'alternative': ['literary fiction', 'experimental fiction', 'contemporary'],
};

// Artist-specific book recommendations (curated examples)
const artistBooks: Record<string, BookRecommendation[]> = {
  'sabrina carpenter': [
    {
      id: '1',
      title: 'The Seven Husbands of Evelyn Hugo',
      author: 'Taylor Jenkins Reid',
      description: 'A reclusive Hollywood icon tells her life story to a young journalist.',
      genre: 'Contemporary Fiction',
      reason: 'Like Sabrina\'s music, this book explores themes of love, growth, and finding your authentic voice in the spotlight.',
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/P/1501161938.01.L.jpg',
      amazonUrl: 'https://www.amazon.com/Seven-Husbands-Evelyn-Hugo-Novel/dp/1501161938',
      rating: 4.8
    },
    {
      id: '2',
      title: 'Beach Read',
      author: 'Emily Henry',
      description: 'Two rival writers challenge each other to write outside their comfort zones.',
      genre: 'Romance',
      reason: 'Perfect match for Sabrina\'s pop sensibilities - fun, romantic, and emotionally resonant.',
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/P/1984806734.01.L.jpg',
      amazonUrl: 'https://www.amazon.com/Beach-Read-Emily-Henry/dp/1984806734',
      rating: 4.6
    },
    {
      id: '3',
      title: 'The Midnight Library',
      author: 'Matt Haig',
      description: 'A woman discovers a library between life and death with infinite possibilities.',
      genre: 'Contemporary Fiction',
      reason: 'Reflects themes of self-discovery and choosing your path, similar to Sabrina\'s journey in music.',
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/P/0525559477.01.L.jpg',
      amazonUrl: 'https://www.amazon.com/Midnight-Library-Novel-Matt-Haig/dp/0525559477',
      rating: 4.7
    },
    {
      id: '4',
      title: 'Red, White & Royal Blue',
      author: 'Casey McQuiston',
      description: 'A romance between the First Son and the Prince of Wales.',
      genre: 'Romance',
      reason: 'Young, fresh, and full of heart - captures the same energy as Sabrina\'s upbeat pop anthems.',
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/P/1250316774.01.L.jpg',
      amazonUrl: 'https://www.amazon.com/Red-White-Royal-Blue-Novel/dp/1250316774',
      rating: 4.5
    },
    {
      id: '5',
      title: 'The Spanish Love Deception',
      author: 'Elena Armas',
      description: 'A fake dating romance with academic rivals.',
      genre: 'Romance',
      reason: 'Like Sabrina\'s songs about complicated relationships and finding love in unexpected places.',
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/P/1668001225.01.L.jpg',
      amazonUrl: 'https://www.amazon.com/Spanish-Love-Deception-Elena-Armas/dp/1668001225',
      rating: 4.4
    }
  ],
  'taylor swift': [
    {
      id: '6',
      title: 'Normal People',
      author: 'Sally Rooney',
      description: 'The complex relationship between two Irish teenagers through their years at school and university.',
      genre: 'Literary Fiction',
      reason: 'Like Taylor\'s songwriting, this explores the intricacies of relationships with raw emotional honesty.',
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/P/1984822179.01.L.jpg',
      amazonUrl: 'https://www.amazon.com/Normal-People-Novel-Sally-Rooney/dp/1984822179',
      rating: 4.3
    },
    {
      id: '7',
      title: 'The Invisible Life of Addie LaRue',
      author: 'V.E. Schwab',
      description: 'A woman cursed to be forgotten by everyone she meets lives for 300 years.',
      genre: 'Fantasy',
      reason: 'Matches Taylor\'s storytelling prowess and themes of memory, legacy, and enduring love.',
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/P/0765387565.01.L.jpg',
      amazonUrl: 'https://www.amazon.com/Invisible-Life-Addie-LaRue/dp/0765387565',
      rating: 4.6
    },
    {
      id: '8',
      title: 'Little Women',
      author: 'Louisa May Alcott',
      description: 'The classic story of the March sisters coming of age during the Civil War.',
      genre: 'Classic Literature',
      reason: 'Perfect for Taylor\'s nostalgic storytelling style and themes of sisterhood and growing up.',
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/P/0147514010.01.L.jpg',
      amazonUrl: 'https://www.amazon.com/Little-Women-Louisa-May-Alcott/dp/0147514010',
      rating: 4.8
    },
    {
      id: '9',
      title: 'The Song of Achilles',
      author: 'Madeline Miller',
      description: 'A retelling of the Trojan War through the relationship of Achilles and Patroclus.',
      genre: 'Mythology',
      reason: 'Epic storytelling and emotional depth that matches Taylor\'s lyrical narrative style.',
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/P/0062060627.01.L.jpg',
      amazonUrl: 'https://www.amazon.com/Song-Achilles-Madeline-Miller/dp/0062060627',
      rating: 4.7
    },
    {
      id: '10',
      title: 'Eleanor Oliphant Is Completely Fine',
      author: 'Gail Honeyman',
      description: 'A socially awkward woman\'s journey of self-discovery and healing.',
      genre: 'Contemporary Fiction',
      reason: 'Explores themes of personal growth and finding yourself, similar to Taylor\'s introspective albums.',
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/P/0735220697.01.L.jpg',
      amazonUrl: 'https://www.amazon.com/Eleanor-Oliphant-Completely-Fine-Novel/dp/0735220697',
      rating: 4.5
    }
  ]
};

// Generate recommendations based on artist genres
function generateGenreBasedRecommendations(artist: { id: string; name: string; genres?: string[] }): BookRecommendation[] {
  const artistGenres = artist.genres?.slice(0, 3) || [];
  const bookGenres = new Set<string>();
  
  // Map music genres to book genres
  artistGenres.forEach((genre: string) => {
    const lowerGenre = genre.toLowerCase();
    Object.keys(genreMapping).forEach(musicGenre => {
      if (lowerGenre.includes(musicGenre)) {
        genreMapping[musicGenre].forEach(bookGenre => bookGenres.add(bookGenre));
      }
    });
  });

  // Create generic recommendations based on genres
  const recommendations: BookRecommendation[] = [
    {
      id: `${artist.id}-1`,
      title: 'The Atlas Six',
      author: 'Olivie Blake',
      description: 'Six young magicians compete for a place in an ancient society.',
      genre: Array.from(bookGenres)[0] || 'Fantasy',
      reason: `Based on ${artist.name}'s ${artistGenres.join(', ')} style - magical and atmospheric.`,
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/P/1250854954.01.L.jpg',
      amazonUrl: 'https://www.amazon.com/Atlas-Six-Olivie-Blake/dp/1250854954',
      rating: 4.2
    },
    {
      id: `${artist.id}-2`,
      title: 'Klara and the Sun',
      author: 'Kazuo Ishiguro',
      description: 'An artificial friend observes the world with wonder and concern.',
      genre: Array.from(bookGenres)[1] || 'Literary Fiction',
      reason: `Matches the emotional depth found in ${artist.name}'s music.`,
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/P/0593318188.01.L.jpg',
      amazonUrl: 'https://www.amazon.com/Klara-Sun-novel-Kazuo-Ishiguro/dp/0593318188',
      rating: 4.4
    },
    {
      id: `${artist.id}-3`,
      title: 'The Vanishing Half',
      author: 'Brit Bennett',
      description: 'Twin sisters choose different paths in life and identity.',
      genre: Array.from(bookGenres)[2] || 'Contemporary Fiction',
      reason: `Like ${artist.name}'s songs, this explores themes of identity and choosing your own path.`,
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/P/0525536299.01.L.jpg',
      amazonUrl: 'https://www.amazon.com/Vanishing-Half-Novel-Brit-Bennett/dp/0525536299',
      rating: 4.6
    },
    {
      id: `${artist.id}-4`,
      title: 'Mexican Gothic',
      author: 'Silvia Moreno-Garcia',
      description: 'A young woman investigates her cousin\'s mysterious illness.',
      genre: 'Gothic Fiction',
      reason: `The atmospheric quality matches the mood of ${artist.name}'s music.`,
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/P/0525620788.01.L.jpg',
      amazonUrl: 'https://www.amazon.com/Mexican-Gothic-Silvia-Moreno-Garcia/dp/0525620788',
      rating: 4.3
    },
    {
      id: `${artist.id}-5`,
      title: 'Circe',
      author: 'Madeline Miller',
      description: 'The story of the Greek goddess Circe and her transformation.',
      genre: 'Mythology',
      reason: `Epic storytelling that complements the narrative quality in ${artist.name}'s work.`,
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/P/0316556343.01.L.jpg',
      amazonUrl: 'https://www.amazon.com/Circe-Madeline-Miller/dp/0316556343',
      rating: 4.7
    }
  ];

  return recommendations;
}

export async function POST(request: NextRequest) {
  try {
    const { artist } = await request.json();
    
    if (!artist) {
      return NextResponse.json({ error: 'Artist data is required' }, { status: 400 });
    }

    // Check if we have curated recommendations for this artist
    const artistName = artist.name.toLowerCase();
    let recommendations: BookRecommendation[] = [];
    
    if (artistBooks[artistName]) {
      recommendations = artistBooks[artistName];
    } else {
      // Generate recommendations based on genres
      recommendations = generateGenreBasedRecommendations(artist);
    }

    return NextResponse.json({
      artist: artist.name,
      genres: artist.genres || [],
      recommendations,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating book recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}