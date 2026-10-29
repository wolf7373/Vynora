export interface LyricLine {
  time: number
  text: string
}

export interface ResonixTrack {
  id: string
  title: string
  artist: string
  album: string
  playlistId: string
  duration: string
  durationSec: number
  bpm?: number
  style?: string
  scale?: number[]
  cover: string
  color?: string
  liked?: boolean
  lyrics?: LyricLine[]
  audioUrl?: string
  isRealSpotify?: boolean
  spotifyUri?: string
  embedId?: string
  embedType?: string
  youtubeId?: string
  isOfflineAvailable?: boolean
  offlineSizeBytes?: number
}

export interface ResonixPlaylist {
  id: string
  title: string
  description: string
  cover: string
  trackCount: number
  color: string
  spotifyId?: string
  isRealSpotify?: boolean
  isCustom?: boolean
  trackIds?: string[];
  createdAt?: number;
}

export interface SavedStream {
  id: string
  url: string
  title: string
  type: string
  playedAt: string
  cover?: string
  artist?: string
}

export const PLAYLISTS: ResonixPlaylist[] = [
  {
    id: 'saved-playlist',
    title: 'My Saved Playlist (whushh)',
    description: 'Your real Spotify playlist with all your favorite songs and full streaming.',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84c61decc5a2592bcbf090bea8',
    trackCount: 50,
    color: '#1ed760',
    spotifyId: '3ZljLLEiktD5EDxXjxLcVT',
    isRealSpotify: true
  },
  {
    id: 'bollywood-butter',
    title: 'Bollywood Central',
    description: 'The freshest, most trending Bollywood hits, soulful romance, and melodies.',
    cover: 'https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg',
    trackCount: 15,
    color: '#1e3264',
    spotifyId: '37i9dQZF1DWXtlo6ENS92N',
    isRealSpotify: true
  },
  {
    id: 'punjabi-hits',
    title: 'Top Punjabi Hits',
    description: 'Trending Punjabi bangers, hip-hop, 808 bass, and chartbusters.',
    cover: 'https://i.ytimg.com/vi/vsWxs1tuwDk/hqdefault.jpg',
    trackCount: 14,
    color: '#e13300',
    spotifyId: '3lot3HM1GHmXDzJFt1cjTb',
    isRealSpotify: true
  },
  {
    id: 'top-hits',
    title: "Today's Top Hits",
    description: 'The biggest international and chart-topping hits right now.',
    cover: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg',
    trackCount: 12,
    color: '#8400e7',
    spotifyId: '37i9dQZF1DXcBWIGoYBM5M',
    isRealSpotify: true
  },
  {
    id: 'peaceful-piano',
    title: 'Peaceful Piano & Lofi Flow',
    description: 'Relaxing instrumental piano and soothing focus melodies.',
    cover: 'https://i.ytimg.com/vi/7maJOI3QMu0/hqdefault.jpg',
    trackCount: 3,
    color: '#ba5d07',
    spotifyId: '37i9dQZF1DX4sWSpwq3LiO',
    isRealSpotify: true
  }
];

export const INITIAL_TRACKS: ResonixTrack[] = [
  // ==========================================
  // BOLLYWOOD CENTRAL (15 Full Songs)
  // ==========================================
  {
    id: 'bolly-kesariya',
    youtubeId: 'BddP6PYo2gs',
    title: 'Kesariya',
    artist: 'Pritam, Arijit Singh, Amitabh Bhattacharya',
    album: 'Brahmastra',
    playlistId: 'bollywood-butter',
    duration: '4:28',
    durationSec: 268,
    bpm: 105,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg',
    audioUrl: 'https://aac.saavncdn.com/423/852ad6cc81d7733c5e9bfc46d7b063e2_320.mp4',
    color: '#1e3264',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Acoustic Guitar Intro]' },
      { time: 10, text: 'Mujhko itna bataye koi, kaise tujhse dil na lagaye koi' },
      { time: 24, text: 'Rabba ne tujhko banane mein kar di hai husn ki khaali tijoriyan' },
      { time: 42, text: 'Kesariya tera ishq hai piya, rang jaaun jo main haath lagaun' },
      { time: 60, text: 'Din beete saara teri fikr mein, rain saari teri khair manaun' }
    ]
  },
  {
    id: 'bolly-apna-bana-le',
    youtubeId: 'ElZfdU54Cp8',
    title: 'Apna Bana Le',
    artist: 'Arijit Singh, Sachin-Jigar',
    album: 'Bhediya',
    playlistId: 'bollywood-butter',
    duration: '4:21',
    durationSec: 261,
    bpm: 98,
    style: 'ambient',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/ElZfdU54Cp8/hqdefault.jpg',
    audioUrl: 'https://aac.saavncdn.com/228/bed7fe5f8fe04ae6432bcb0717e2b74e_320.mp4',
    color: '#e13300',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Melodic Piano Chords]' },
      { time: 14, text: 'Tu mera koi na hoke bhi kuch laage' },
      { time: 28, text: 'Kiya re jo bhi toone kaise kiya re' },
      { time: 42, text: 'Apna bana le piya, apna bana le piya' },
      { time: 62, text: 'Dil ke nagar mein shehar tu basa le piya' }
    ]
  },
  {
    id: 'bolly-tum-hi-ho',
    youtubeId: 'Umqb9KENgmk',
    title: 'Tum Hi Ho',
    artist: 'Arijit Singh, Mithoon',
    album: 'Aashiqui 2',
    playlistId: 'bollywood-butter',
    duration: '4:28',
    durationSec: 268,
    bpm: 94,
    style: 'ambient',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/Umqb9KENgmk/hqdefault.jpg',
    color: '#1e3264',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Piano Melancholy Intro]' },
      { time: 10, text: 'Hum tere bin ab reh nahi sakte' },
      { time: 22, text: 'Tere bina kya wajood mera' },
      { time: 35, text: 'Kyunki tum hi ho, ab tum hi ho' },
      { time: 55, text: 'Zindagi ab tum hi ho, chain bhi mera dard bhi' }
    ]
  },
  {
    id: 'bolly-o-maahi',
    youtubeId: 'Etkd-07gnxM',
    title: 'O Maahi',
    artist: 'Arijit Singh, Pritam',
    album: 'Dunki',
    playlistId: 'bollywood-butter',
    duration: '3:53',
    durationSec: 233,
    bpm: 100,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/Etkd-07gnxM/hqdefault.jpg',
    color: '#e13300',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Acoustic Guitar Strumming]' },
      { time: 12, text: 'O maahi o maahi, o maahi o maahi' },
      { time: 25, text: 'Dil dharakne ki tu hi wajah hai' },
      { time: 45, text: 'Tere ishq mein sab kuch gawa diya' }
    ]
  },
  {
    id: 'bolly-pehle-bhi-main',
    youtubeId: 'iAIBF2ngbWY',
    title: 'Pehle Bhi Main',
    artist: 'Vishal Mishra, Raj Shekhar',
    album: 'Animal',
    playlistId: 'bollywood-butter',
    duration: '4:10',
    durationSec: 250,
    bpm: 96,
    style: 'ambient',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/iAIBF2ngbWY/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Deep Cinematic Bass & Strings]' },
      { time: 14, text: 'Pehle bhi main tumse mila hoon' },
      { time: 28, text: 'Pehli dafaa hi milke laga' },
      { time: 48, text: 'Tune chhua zakhm ko mere, marham ban gaya har dard mera' }
    ]
  },
  {
    id: 'bolly-tauba-tauba',
    youtubeId: 'LK7-_dgAVQE',
    title: 'Tauba Tauba',
    artist: 'Karan Aujla',
    album: 'Bad Newz',
    playlistId: 'bollywood-butter',
    duration: '3:26',
    durationSec: 206,
    bpm: 104,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/LK7-_dgAVQE/hqdefault.jpg',
    color: '#e13300',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Signature Vicky Kaushal Groove Beat]' },
      { time: 12, text: 'Husn tera tauba tauba' },
      { time: 24, text: 'Kare dil nu bekaabu ni' },
      { time: 44, text: 'Jadon lakk hilave mundeyan di jaan kadd lave' }
    ]
  },
  {
    id: 'bolly-chaleya',
    youtubeId: 'VAdGW7QDJiU',
    title: 'Chaleya',
    artist: 'Anirudh Ravichander, Arijit Singh, Shilpa Rao',
    album: 'Jawan',
    playlistId: 'bollywood-butter',
    duration: '3:20',
    durationSec: 200,
    bpm: 124,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/VAdGW7QDJiU/hqdefault.jpg',
    color: '#1e3264',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Anirudh Hook Synths]' },
      { time: 10, text: 'Ishq mein dil bana hai, ishq mein dil fana hai' },
      { time: 24, text: 'Teri ore chaleya re, chaleya re' },
      { time: 44, text: 'Mita de har doori, tu hi meri manzil hai' }
    ]
  },
  {
    id: 'bolly-heeriye',
    youtubeId: 'RLzC55ai0eo',
    title: 'Heeriye',
    artist: 'Jasleen Royal, Arijit Singh',
    album: 'Heeriye Single',
    playlistId: 'bollywood-butter',
    duration: '3:15',
    durationSec: 195,
    bpm: 110,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/RLzC55ai0eo/hqdefault.jpg',
    color: '#2d46b9',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Sweet Acoustic Guitar Melody]' },
      { time: 10, text: 'Heeriye heeriye aa...' },
      { time: 24, text: 'Teri hoke maram main, tu ban mera jahaan' },
      { time: 45, text: 'Chhute na kadi hath mera' }
    ]
  },
  {
    id: 'bolly-channa-mereya',
    youtubeId: '284Ov7ysmfA',
    title: 'Channa Mereya',
    artist: 'Pritam, Arijit Singh',
    album: 'Ae Dil Hai Mushkil',
    playlistId: 'bollywood-butter',
    duration: '4:49',
    durationSec: 289,
    bpm: 88,
    style: 'ambient',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/284Ov7ysmfA/hqdefault.jpg',
    color: '#e13300',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Sufi Acoustic Harmonies]' },
      { time: 15, text: 'Acha chalta hoon, duaon mein yaad rakhna' },
      { time: 35, text: 'Andhera tera maine le liya, mera ujla sitaara tere naam kiya' },
      { time: 55, text: 'Channa mereya mereya, channa mereya mereya' }
    ]
  },
  {
    id: 'bolly-raataan-lambiyan',
    youtubeId: 'gvyUuxdRdR4',
    title: 'Raataan Lambiyan',
    artist: 'Tanishk Bagchi, Jubin Nautiyal, Asees Kaur',
    album: 'Shershaah',
    playlistId: 'bollywood-butter',
    duration: '3:50',
    durationSec: 230,
    bpm: 102,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/gvyUuxdRdR4/hqdefault.jpg',
    color: '#1e3264',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Romantic Strings]' },
      { time: 12, text: 'Kaate kate na kat te ye din ye raat' },
      { time: 26, text: 'Raataan lambiyan lambiyan re, kate tere sangeyan sangeyan' }
    ]
  },
  {
    id: 'bolly-agar-tum-saath-ho',
    youtubeId: 'sK7riqg2mr4',
    title: 'Agar Tum Saath Ho',
    artist: 'A.R. Rahman, Arijit Singh, Alka Yagnik',
    album: 'Tamasha',
    playlistId: 'bollywood-butter',
    duration: '5:41',
    durationSec: 341,
    bpm: 86,
    style: 'ambient',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/sK7riqg2mr4/hqdefault.jpg',
    color: '#477d95',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [A.R. Rahman Iconic Melody]' },
      { time: 18, text: 'Pal bhar theher jaao, dil ye sambhal jaaye' },
      { time: 38, text: 'Tum saath ho ya na ho kya fark hai, bedard thi zindagi bedard hai' },
      { time: 60, text: 'Agar tum saath ho, dil ye sambhal jaaye' }
    ]
  },
  {
    id: 'bolly-ve-kamleya',
    youtubeId: 'QXJyMpxd210',
    title: 'Ve Kamleya',
    artist: 'Pritam, Arijit Singh, Shreya Ghoshal',
    album: 'Rocky Aur Rani Kii Prem Kahaani',
    playlistId: 'bollywood-butter',
    duration: '4:06',
    durationSec: 246,
    bpm: 96,
    style: 'ambient',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/QXJyMpxd210/hqdefault.jpg',
    color: '#ba5d07',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Warm Mandolin Plucking]' },
      { time: 14, text: 'Ve kamleya, ve kamleya jaada na kar sataya' },
      { time: 30, text: 'Kedi gallan ditiyan tu saade dil nu sazaa' }
    ]
  },
  {
    id: 'bolly-satranga',
    youtubeId: 'HrnrqYxYrbk',
    title: 'Satranga',
    artist: 'Arijit Singh, Shreyas Puranik',
    album: 'Animal',
    playlistId: 'bollywood-butter',
    duration: '4:31',
    durationSec: 271,
    bpm: 92,
    style: 'ambient',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/HrnrqYxYrbk/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Melancholic Violin Intro]' },
      { time: 16, text: 'Satranga yeh daastaan, adhoora sa reh gaya jahaan' },
      { time: 36, text: 'Koyi toh roko is dil ke raste' }
    ]
  },
  {
    id: 'bolly-kabira',
    youtubeId: 'jHNNMj5bNQw',
    title: 'Kabira',
    artist: 'Pritam, Tochi Raina, Rekha Bhardwaj',
    album: 'Yeh Jawaani Hai Deewani',
    playlistId: 'bollywood-butter',
    duration: '3:43',
    durationSec: 223,
    bpm: 98,
    style: 'ambient',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/jHNNMj5bNQw/hqdefault.jpg',
    color: '#ba5d07',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Folk Acoustic Guitar Intro]' },
      { time: 15, text: 'Kaisi teri khudgarzi na dhoop chune na chhaon' },
      { time: 35, text: 'Re Kabira maan jaa, re Fakeera maan jaa' }
    ]
  },
  {
    id: 'bolly-shayad',
    youtubeId: '9-LH8ABADdo',
    title: 'Shayad',
    artist: 'Pritam, Arijit Singh',
    album: 'Love Aaj Kal',
    playlistId: 'bollywood-butter',
    duration: '4:07',
    durationSec: 247,
    bpm: 94,
    style: 'ambient',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/9-LH8ABADdo/hqdefault.jpg',
    color: '#1e3264',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Gentle Fingerstyle Guitar]' },
      { time: 14, text: 'Shayad kabhi na keh sakoon main tumko' },
      { time: 32, text: 'Kahe bina samajh lo tum shayad' },
      { time: 50, text: 'Jo tum na ho, rahenge hum nahi' }
    ]
  },

  // ==========================================
  // TOP PUNJABI HITS (14 Full Songs)
  // ==========================================
  {
    id: 'punj-softly',
    youtubeId: 'cWMxCE2HTag',
    title: 'Softly',
    artist: 'Karan Aujla, Ikky',
    album: 'Making Memories',
    playlistId: 'punjabi-hits',
    duration: '2:35',
    durationSec: 155,
    bpm: 108,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/cWMxCE2HTag/hqdefault.jpg',
    audioUrl: 'https://aac.saavncdn.com/538/727114725cd7ec508b1df0a7e4515e5e_320.mp4',
    color: '#b06239',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Ikky Signature Synth Beat]' },
      { time: 8, text: 'Kamm saare chhad aawan, tere kol beh jaawan' },
      { time: 18, text: 'Akhan vich akhan paa ke sab bhull jaawan' },
      { time: 30, text: 'Softly softly kardi gallan mere naal' }
    ]
  },
  {
    id: 'punj-winning-speech',
    youtubeId: 'vsWxs1tuwDk',
    title: 'Winning Speech',
    artist: 'Karan Aujla, Mxrci',
    album: 'Street Dreams',
    playlistId: 'punjabi-hits',
    duration: '3:47',
    durationSec: 227,
    bpm: 112,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/vsWxs1tuwDk/hqdefault.jpg',
    audioUrl: 'https://aac.saavncdn.com/089/64beffa430e4c948223ec6bfcc3a13f0_320.mp4',
    color: '#1e3264',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Heavy 808 Bass & Brass Intro]' },
      { time: 12, text: 'Kithon kithon uth ke kithe aa gaye aan' },
      { time: 24, text: 'Winning speech dene da time aa gaya' },
      { time: 45, text: 'Mehnat da mull paunda ae rab sacha' }
    ]
  },
  {
    id: 'punj-295',
    youtubeId: 'n_FCrCQ6-bA',
    title: '295',
    artist: 'Sidhu Moose Wala',
    album: 'Moosetape',
    playlistId: 'punjabi-hits',
    duration: '4:33',
    durationSec: 273,
    bpm: 128,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/n_FCrCQ6-bA/hqdefault.jpg',
    color: '#e13300',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [The Kidd Hard-Hitting Hip-Hop Beat]' },
      { time: 14, text: 'Dass keda karda ni ethe aitbaar' },
      { time: 28, text: 'Nitt nawan mudda ethe ban-da rehnda' },
      { time: 48, text: 'Sach bolan te lage dhara do sau pichhanve' }
    ]
  },
  {
    id: 'punj-cheques',
    youtubeId: '4tywp83zkmk',
    title: 'Cheques',
    artist: 'Shubh',
    album: 'Still Rollin',
    playlistId: 'punjabi-hits',
    duration: '3:09',
    durationSec: 189,
    bpm: 96,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/4tywp83zkmk/hqdefault.jpg',
    color: '#2d46b9',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Chill Trap Beat with Heavy Bass]' },
      { time: 10, text: 'Baapu kehnda kade haar na manni' },
      { time: 22, text: 'Hath vich check te pocket vich cash' },
      { time: 42, text: 'Still rollin, sidha muh te gall karida' }
    ]
  },
  {
    id: 'punj-goat',
    youtubeId: 'cl0a3i2wFcc',
    title: 'G.O.A.T.',
    artist: 'Diljit Dosanjh',
    album: 'G.O.A.T.',
    playlistId: 'punjabi-hits',
    duration: '3:43',
    durationSec: 223,
    bpm: 104,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/cl0a3i2wFcc/hqdefault.jpg',
    color: '#e13300',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Dosanjhanwala Anthem Drop]' },
      { time: 12, text: 'Diamond jayi jodi teri meri' },
      { time: 24, text: 'Gabru nu jachdi ae shaan' },
      { time: 45, text: 'G.O.A.T. ban ke dikhaya duniya nu' }
    ]
  },
  {
    id: 'punj-mi-amor',
    youtubeId: 'z1VdU6ZwRwY',
    title: 'Mi Amor',
    artist: 'Sharn, 408',
    album: 'Mi Amor Single',
    playlistId: 'punjabi-hits',
    duration: '3:46',
    durationSec: 226,
    bpm: 108,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/z1VdU6ZwRwY/hqdefault.jpg',
    color: '#e13300',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Afro-Bhangra Fusion Drop]' },
      { time: 12, text: 'Kehndi hundi si chann tak raah bana de' },
      { time: 24, text: 'Bolo na bolo na mi amor' },
      { time: 46, text: 'Tere bina dil nayyo lagda mera' }
    ]
  },
  {
    id: 'punj-one-love',
    youtubeId: '0pWsCiBvLOk',
    title: 'One Love',
    artist: 'Shubh',
    album: 'Leo',
    playlistId: 'punjabi-hits',
    duration: '2:40',
    durationSec: 160,
    bpm: 100,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/0pWsCiBvLOk/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Smooth Melodic Trap Beat]' },
      { time: 10, text: 'One love mere kol ikko hi ae' },
      { time: 22, text: 'Tere naam kiti har ik saah' }
    ]
  },
  {
    id: 'punj-same-beef',
    youtubeId: 'qk2WMmiiVFE',
    title: 'Same Beef',
    artist: 'Bohemia, Sidhu Moose Wala',
    album: 'Same Beef Single',
    playlistId: 'punjabi-hits',
    duration: '4:12',
    durationSec: 252,
    bpm: 96,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/qk2WMmiiVFE/hqdefault.jpg',
    color: '#1e3264',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Bohemia Iconic Desi Hip-Hop Drop]' },
      { time: 14, text: 'Same beef kade kiti ni' },
      { time: 28, text: 'Sadde naal vair paunde jede, ohna nu pata' }
    ]
  },
  {
    id: 'punj-so-high',
    youtubeId: 'GgmFC8y8q3k',
    title: 'So High',
    artist: 'Sidhu Moose Wala, BYG BYRD',
    album: 'PBX 1',
    playlistId: 'punjabi-hits',
    duration: '3:52',
    durationSec: 232,
    bpm: 110,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/GgmFC8y8q3k/hqdefault.jpg',
    color: '#e13300',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [BYG BYRD On The Beat]' },
      { time: 12, text: 'Sir utte rakhda ae maut da khauf nahi' },
      { time: 24, text: 'Jatt da level so high' }
    ]
  },
  {
    id: 'punj-elevated',
    youtubeId: '_-kyMPUchJs',
    title: 'Elevated',
    artist: 'Shubh',
    album: 'Elevated Single',
    playlistId: 'punjabi-hits',
    duration: '3:21',
    durationSec: 201,
    bpm: 98,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/_-kyMPUchJs/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Elevated Chill Vibe Intro]' },
      { time: 10, text: 'Kamm saare high class chalde' },
      { time: 22, text: 'Look elevated, mood elevated' }
    ]
  },
  {
    id: 'punj-baller',
    youtubeId: 'k1BneeJTDcU',
    title: 'Baller',
    artist: 'Shubh, Ikky',
    album: 'Baller Single',
    playlistId: 'punjabi-hits',
    duration: '2:30',
    durationSec: 150,
    bpm: 102,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/k1BneeJTDcU/hqdefault.jpg',
    color: '#e13300',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Heavy Snare & Bass Roll]' },
      { time: 10, text: 'Main baller, game change karda' }
    ]
  },
  {
    id: 'punj-lover',
    youtubeId: 'm4_9TFeMfJE',
    title: 'Lover',
    artist: 'Diljit Dosanjh, Intense',
    album: 'MoonChild Era',
    playlistId: 'punjabi-hits',
    duration: '3:20',
    durationSec: 200,
    bpm: 114,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/m4_9TFeMfJE/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Synth-Pop Bhangra Fusion]' },
      { time: 12, text: 'Tera ni main lover, tera ni main lover' },
      { time: 26, text: 'Akhan naal dil mangdi ae' }
    ]
  },
  {
    id: 'punj-brown-munde',
    youtubeId: 'VNs_cCtdbPc',
    title: 'Brown Munde',
    artist: 'AP Dhillon, Gurinder Gill, Shinda Kahlon',
    album: 'Not by Chance',
    playlistId: 'punjabi-hits',
    duration: '4:26',
    durationSec: 266,
    bpm: 96,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/VNs_cCtdbPc/hqdefault.jpg',
    color: '#1e3264',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Worldwide Iconic Drill Intro]' },
      { time: 12, text: 'Desi jehe geet aa trapan di beat aa' },
      { time: 25, text: 'Brown munde, brown munde' }
    ]
  },
  {
    id: 'punj-excuses',
    youtubeId: 'vX2cDW8LUWk',
    title: 'Excuses',
    artist: 'AP Dhillon, Gurinder Gill',
    album: 'Hidden Gems',
    playlistId: 'punjabi-hits',
    duration: '2:56',
    durationSec: 176,
    bpm: 98,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/vX2cDW8LUWk/hqdefault.jpg',
    color: '#ba5d07',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Melodic Trap Piano]' },
      { time: 10, text: 'Kehndi hundi si chann tak raah bana de' },
      { time: 24, text: 'Dil na tod di mera taan main khush si' }
    ]
  },

  // ==========================================
  // TODAY'S TOP HITS / GLOBAL POP (12 Songs)
  // ==========================================
  {
    id: 'glob-espresso',
    youtubeId: 'eVli-tstM5E',
    title: 'Espresso',
    artist: 'Sabrina Carpenter',
    album: 'Short n Sweet',
    playlistId: 'top-hits',
    duration: '2:55',
    durationSec: 175,
    bpm: 104,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/eVli-tstM5E/hqdefault.jpg',
    audioUrl: 'https://aac.saavncdn.com/111/cf81f6eb5b6768fe2e1ddf9335124a5f_320.mp4',
    color: '#8d67ab',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Funky Bassline & Percussion]' },
      { time: 12, text: "Say you can't sleep, baby, I know" },
      { time: 24, text: "That's that me espresso" }
    ]
  },
  {
    id: 'glob-blinding-lights',
    youtubeId: '4NRXx6U8ABQ',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    playlistId: 'top-hits',
    duration: '3:20',
    durationSec: 200,
    bpm: 171,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg',
    color: '#e13300',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [80s Synth Drum & Arpeggiator]' },
      { time: 15, text: "I've been on my own for long enough" },
      { time: 28, text: 'Maybe you can show me how to love, maybe' },
      { time: 48, text: "I'm blinded by the lights, no I can't sleep until I feel your touch" }
    ]
  },
  {
    id: 'glob-starboy',
    youtubeId: '34Na4j8AVgA',
    title: 'Starboy',
    artist: 'The Weeknd, Daft Punk',
    album: 'Starboy',
    playlistId: 'top-hits',
    duration: '3:50',
    durationSec: 230,
    bpm: 186,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/34Na4j8AVgA/hqdefault.jpg',
    color: '#1e3264',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Daft Punk Electro Piano Intro]' },
      { time: 14, text: "I'm tryna put you in the worst mood, ah" },
      { time: 28, text: 'P1 cleaner than your church shoes, ah' },
      { time: 45, text: "Look what you've done, I'm a motherfuckin' starboy" }
    ]
  },
  {
    id: 'glob-die-with-a-smile',
    youtubeId: 'kPa7bsKwL-c',
    title: 'Die With A Smile',
    artist: 'Lady Gaga, Bruno Mars',
    album: 'Die With A Smile Single',
    playlistId: 'top-hits',
    duration: '4:11',
    durationSec: 251,
    bpm: 104,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/kPa7bsKwL-c/hqdefault.jpg',
    color: '#1e3264',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Soulful Piano & Vintage Guitars]' },
      { time: 15, text: "If the world was ending, I'd wanna be next to you" },
      { time: 35, text: "If the party was over and our time on Earth was through" }
    ]
  },
  {
    id: 'glob-shape-of-you',
    youtubeId: 'JGwWNGJdvx8',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: 'Divide',
    playlistId: 'top-hits',
    duration: '3:53',
    durationSec: 233,
    bpm: 96,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg',
    color: '#477d95',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Acoustic Marimba Loop]' },
      { time: 15, text: "The club isn't the best place to find a lover" },
      { time: 30, text: "I'm in love with the shape of you" }
    ]
  },
  {
    id: 'glob-stay',
    youtubeId: 'bc0KhhjJP98',
    title: 'Stay',
    artist: 'The Kid LAROI, Justin Bieber',
    album: 'F*CK LOVE 3: OVER YOU',
    playlistId: 'top-hits',
    duration: '2:21',
    durationSec: 141,
    bpm: 170,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/bc0KhhjJP98/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Upbeat Synth Rush]' },
      { time: 10, text: 'I do the same thing I told you that I never would' },
      { time: 24, text: "I need you to stay, need you to stay, hey" }
    ]
  },
  {
    id: 'glob-save-your-tears',
    youtubeId: 'XXYlFuWEuKI',
    title: 'Save Your Tears',
    artist: 'The Weeknd',
    album: 'After Hours',
    playlistId: 'top-hits',
    duration: '3:35',
    durationSec: 215,
    bpm: 118,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/XXYlFuWEuKI/hqdefault.jpg',
    color: '#e13300',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Synth-Pop Drums]' },
      { time: 14, text: 'I saw you dancing in a crowded room' },
      { time: 28, text: 'Save your tears for another day' }
    ]
  },
  {
    id: 'glob-levitating',
    youtubeId: 'TUVcZfQe-Kw',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    playlistId: 'top-hits',
    duration: '3:23',
    durationSec: 203,
    bpm: 103,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/TUVcZfQe-Kw/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Space Disco Bassline]' },
      { time: 12, text: "If you wanna run away with me, I know a galaxy" },
      { time: 25, text: "You want me, I want you, baby, my sugarboo, I'm levitating" }
    ]
  },
  {
    id: 'glob-as-it-was',
    youtubeId: 'H5v3kku4y6Q',
    title: 'As It Was',
    artist: 'Harry Styles',
    album: "Harry's House",
    playlistId: 'top-hits',
    duration: '2:47',
    durationSec: 167,
    bpm: 174,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Breezy Indie Synth Chimes]' },
      { time: 12, text: 'Hold on, ring the bell and let him in' },
      { time: 25, text: "You know it's not the same as it was" }
    ]
  },
  {
    id: 'glob-flowers',
    youtubeId: 'G7KNmW9a75Y',
    title: 'Flowers',
    artist: 'Miley Cyrus',
    album: 'Endless Summer Vacation',
    playlistId: 'top-hits',
    duration: '3:20',
    durationSec: 200,
    bpm: 118,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/G7KNmW9a75Y/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Disco Pop Groove]' },
      { time: 14, text: 'We were good, we were gold' },
      { time: 28, text: 'I can buy myself flowers, write my name in the sand' }
    ]
  },
  {
    id: 'glob-cruel-summer',
    youtubeId: 'ic8j13piAhQ',
    title: 'Cruel Summer',
    artist: 'Taylor Swift',
    album: 'Lover',
    playlistId: 'top-hits',
    duration: '2:58',
    durationSec: 178,
    bpm: 170,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Synth-Pop Dream Loop]' },
      { time: 14, text: 'Fever dream high in the quiet of the night' },
      { time: 26, text: "It's a cruel summer with you" }
    ]
  },
  {
    id: 'glob-birds-of-a-feather',
    youtubeId: 'd5gf9dXbPi0',
    title: 'Birds of a Feather',
    artist: 'Billie Eilish',
    album: 'HIT ME HARD AND SOFT',
    playlistId: 'top-hits',
    duration: '3:18',
    durationSec: 198,
    bpm: 105,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/d5gf9dXbPi0/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Dreamy Electric Guitar Strumming]' },
      { time: 14, text: "I want you to stay 'til I'm in the grave" },
      { time: 28, text: 'Birds of a feather, we should stick together' }
    ]
  },

  // ==========================================
  // PEACEFUL PIANO & AMBIENT (3 Full Masterpieces)
  // ==========================================
  {
    id: 'peace-river-flows',
    youtubeId: '7maJOI3QMu0',
    title: 'River Flows In You',
    artist: 'Yiruma',
    album: 'First Love',
    playlistId: 'peaceful-piano',
    duration: '3:10',
    durationSec: 190,
    bpm: 68,
    style: 'ambient',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/7maJOI3QMu0/hqdefault.jpg',
    color: '#ba5d07',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Timeless Gentle Piano Melodies]' },
      { time: 30, text: 'Immerse in pure acoustic harmony and calm' }
    ]
  },
  {
    id: 'peace-nuvole-bianche',
    youtubeId: '4VR-6AS0-l4',
    title: 'Nuvole Bianche',
    artist: 'Ludovico Einaudi',
    album: 'Una Mattina',
    playlistId: 'peaceful-piano',
    duration: '5:58',
    durationSec: 358,
    bpm: 64,
    style: 'ambient',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/4VR-6AS0-l4/hqdefault.jpg',
    color: '#ba5d07',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Breathtaking Neoclassical Piano]' },
      { time: 45, text: 'Feel the emotional dynamic crescendos and peaceful waves' }
    ]
  },
  {
    id: 'peace-lofi-flow',
    youtubeId: '5qap5aO4i9A',
    title: 'Peaceful Lofi Flow',
    artist: 'Lofi Girl, ChilledCow',
    album: 'Study & Sleep Beats',
    playlistId: 'peaceful-piano',
    duration: '3:00',
    durationSec: 180,
    bpm: 80,
    style: 'lofi',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: 'https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg',
    color: '#ba5d07',
    liked: false,
    lyrics: [
      { time: 0, text: '🎵 [Relaxing Vinyl Crackle & Soft Keys]' },
      { time: 30, text: 'Warm lofi beats for focus, calm, and studying' }
    ]
  }
,
  {
    id: 'hit-soulmate',
    youtubeId: 'k3ijQJjUbTs',
    title: 'Soulmate',
    artist: 'Badshah, Arijit Singh',
    album: 'Ek Tha Raja',
    playlistId: 'bollywood-butter',
    duration: '3:35',
    durationSec: 215,
    bpm: 98,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 349.23, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/k3ijQJjUbTs/hqdefault.jpg',
    color: '#e13300',
    liked: false,
    lyrics: [
      { time: 0, text: '[Smooth Acoustic Intro]' },
      { time: 15, text: 'Tujhse shuru, tujhpe fanaah' },
      { time: 35, text: 'Kare dil tujhse hi baatein har dafa' }
    ]
  },
  {
    id: 'hit-husn',
    youtubeId: 'gXYpH_tE3H4',
    title: 'Husn',
    artist: 'Anuv Jain',
    album: 'Husn Single',
    playlistId: 'bollywood-butter',
    duration: '3:38',
    durationSec: 218,
    bpm: 82,
    style: 'ambient',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/gXYpH_tE3H4/hqdefault.jpg',
    color: '#1e3264',
    liked: false,
    lyrics: [
      { time: 0, text: '[Soulful Acoustic Strings]' },
      { time: 18, text: 'Dekho dekho kaisi baatein yahan ki' },
      { time: 42, text: 'Baatein to har dafa ki hai' }
    ]
  },
  {
    id: 'hit-jo-tum-mere-ho',
    youtubeId: 'ilNt2bikxZ8',
    title: 'Jo Tum Mere Ho',
    artist: 'Anuv Jain',
    album: 'Jo Tum Mere Ho',
    playlistId: 'bollywood-butter',
    duration: '4:12',
    durationSec: 252,
    bpm: 78,
    style: 'ambient',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/ilNt2bikxZ8/hqdefault.jpg',
    color: '#10b981',
    liked: false,
    lyrics: [
      { time: 0, text: '[Gentle Melodic Fingerpicking]' },
      { time: 22, text: 'Jo tum mere ho, toh duniya haseen hai' },
      { time: 50, text: 'Khwabon ki dastaan yeh zameen hai' }
    ]
  },
  {
    id: 'hit-aaj-ki-raat',
    youtubeId: 'hxMNYkLN7tI',
    title: 'Aaj Ki Raat',
    artist: 'Sachin-Jigar, Madhubanti Bagchi',
    album: 'Stree 2',
    playlistId: 'bollywood-butter',
    duration: '3:48',
    durationSec: 228,
    bpm: 120,
    style: 'pop_dance',
    scale: [261.63, 293.66, 349.23, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/hxMNYkLN7tI/hqdefault.jpg',
    color: '#e13300',
    liked: false,
    lyrics: [
      { time: 0, text: '[Groovy High-Energy Bass]' },
      { time: 16, text: 'Aaj ki raat maza husn ka le lo' },
      { time: 38, text: 'Chhalka hai jaam, aankhon se pee lo' }
    ]
  },
  {
    id: 'hit-aayi-nai',
    youtubeId: 'hcm55lU9knw',
    title: 'Aayi Nai',
    artist: 'Pawan Singh, Simran Choudhary',
    album: 'Stree 2',
    playlistId: 'bollywood-butter',
    duration: '2:58',
    durationSec: 178,
    bpm: 126,
    style: 'pop_dance',
    scale: [261.63, 293.66, 349.23, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/hcm55lU9knw/hqdefault.jpg',
    color: '#f97316',
    liked: false,
    lyrics: [
      { time: 0, text: '[Desi Folk Dance Beats]' },
      { time: 14, text: 'Kati raat maine jaag ke saari' },
      { time: 32, text: 'Aayi nai aayi nai tu to aayi nai' }
    ]
  },
  {
    id: 'hit-khoobsurat',
    youtubeId: 'QqqqfWfO9nU',
    title: 'Khoobsurat',
    artist: 'Vishal Mishra, Sachin-Jigar',
    album: 'Stree 2',
    playlistId: 'bollywood-butter',
    duration: '4:04',
    durationSec: 244,
    bpm: 86,
    style: 'jazz_soul',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/QqqqfWfO9nU/hqdefault.jpg',
    color: '#ba5d07',
    liked: false,
    lyrics: [
      { time: 0, text: '[Romantic Piano Opening]' },
      { time: 20, text: 'Tu itni khoobsurat hai, fida deedar pe hum hain' },
      { time: 48, text: 'Kare tareef kya teri, lafz kam hain' }
    ]
  },
  {
    id: 'hit-millionaire',
    youtubeId: 'XO8wew38VM8',
    title: 'Millionaire',
    artist: 'Yo Yo Honey Singh',
    album: 'Glory',
    playlistId: 'punjabi-hits',
    duration: '3:20',
    durationSec: 200,
    bpm: 114,
    style: 'pop_dance',
    scale: [261.63, 293.66, 349.23, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/XO8wew38VM8/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: '[Honey Singh Glory Bassline]' },
      { time: 12, text: 'Jatt da style billo worldwide craze' },
      { time: 30, text: 'Millionaire vibe chaldi saare pase' }
    ]
  },
  {
    id: 'hit-payal',
    youtubeId: 'u2g5mZ6Lq_8',
    title: 'Payal',
    artist: 'Yo Yo Honey Singh, Paradox',
    album: 'Glory',
    playlistId: 'punjabi-hits',
    duration: '3:52',
    durationSec: 232,
    bpm: 104,
    style: 'pop_dance',
    scale: [261.63, 293.66, 349.23, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/u2g5mZ6Lq_8/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: '[Catchy Desi Hip-Hop Rhythm]' },
      { time: 18, text: 'Chhan chhan kardi teri payal' },
      { time: 40, text: 'Gabhru nu kargi sidha ghayal' }
    ]
  },
  {
    id: 'hit-big-dawgs',
    youtubeId: 'hOhPCfyF4hU',
    title: 'Big Dawgs',
    artist: 'Hanumankind, Kalmi',
    album: 'Big Dawgs Single',
    playlistId: 'top-hits',
    duration: '3:53',
    durationSec: 233,
    bpm: 130,
    style: 'cyberpunk',
    scale: [261.63, 293.66, 349.23, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/hOhPCfyF4hU/hqdefault.jpg',
    color: '#1e3264',
    liked: false,
    lyrics: [
      { time: 0, text: '[Heavy Hard-Hitting 808s]' },
      { time: 15, text: 'Yeah we step up in the place with the flow' },
      { time: 35, text: 'Big dawgs rolling and they already know' }
    ]
  },
  {
    id: 'hit-illuminati',
    youtubeId: 'tOM-nWPcR4U',
    title: 'Illuminati',
    artist: 'Sushin Shyam, Dabzee',
    album: 'Aavesham',
    playlistId: 'top-hits',
    duration: '3:14',
    durationSec: 194,
    bpm: 128,
    style: 'synthwave',
    scale: [261.63, 293.66, 349.23, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/tOM-nWPcR4U/hqdefault.jpg',
    color: '#10b981',
    liked: false,
    lyrics: [
      { time: 0, text: '[Electrifying Banger Intro]' },
      { time: 16, text: 'Ranga energy unstoppable flow' }
    ]
  },
  {
    id: 'hit-naina',
    youtubeId: 'qQp9C09lZhc',
    title: 'Naina',
    artist: 'Diljit Dosanjh, Badshah',
    album: 'Crew',
    playlistId: 'punjabi-hits',
    duration: '3:00',
    durationSec: 180,
    bpm: 102,
    style: 'pop_dance',
    scale: [261.63, 293.66, 349.23, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/qQp9C09lZhc/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: '[Diljit Smooth Vocal Intro]' },
      { time: 15, text: 'Naina tere kajrare naina' },
      { time: 34, text: 'Dil saada le gaye tere naina' }
    ]
  },
  {
    id: 'hit-arjan-vailly',
    youtubeId: 'mQSm_Bq19kU',
    title: 'Arjan Vailly',
    artist: 'Bhupinder Babbal',
    album: 'Animal',
    playlistId: 'punjabi-hits',
    duration: '3:02',
    durationSec: 182,
    bpm: 122,
    style: 'pop_dance',
    scale: [261.63, 293.66, 349.23, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/mQSm_Bq19kU/hqdefault.jpg',
    color: '#e13300',
    liked: false,
    lyrics: [
      { time: 0, text: '[High-Octane Dhad Sarangi Beats]' },
      { time: 12, text: 'Arjan vailly ne pair jod ke gandasi maari' }
    ]
  },
  {
    id: 'hit-white-brown-black',
    youtubeId: 'VNs_cCtdbPc',
    title: 'White Brown Black',
    artist: 'Karan Aujla, Avvy Sra',
    album: 'Four Me',
    playlistId: 'punjabi-hits',
    duration: '3:04',
    durationSec: 184,
    bpm: 106,
    style: 'pop_dance',
    scale: [261.63, 293.66, 349.23, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/VNs_cCtdbPc/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: '[Aujla Swag Intro]' },
      { time: 14, text: 'Rang chitti gaddi kaali' }
    ]
  },
  {
    id: 'hit-antidote',
    youtubeId: 'vX2cDY8pgnw',
    title: 'Antidote',
    artist: 'Karan Aujla',
    album: 'Street Dreams',
    playlistId: 'punjabi-hits',
    duration: '3:24',
    durationSec: 204,
    bpm: 96,
    style: 'pop_dance',
    scale: [261.63, 293.66, 349.23, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/vX2cDY8pgnw/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: '[Moody Modern Beats]' },
      { time: 16, text: 'Tere zehar da koi antidote nai' }
    ]
  },
  {
    id: 'hit-jee-ni-lagda',
    youtubeId: 'D8wWqE4gD7g',
    title: 'Jee Ni Lagda',
    artist: 'Karan Aujla',
    album: 'Way Ahead',
    playlistId: 'punjabi-hits',
    duration: '3:40',
    durationSec: 220,
    bpm: 94,
    style: 'jazz_soul',
    scale: [261.63, 293.66, 349.23, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/D8wWqE4gD7g/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: '[Soulful Punjabi Melody]' },
      { time: 18, text: 'Tere bina mera jee ni lagda' }
    ]
  },
  {
    id: 'hit-check-it-out',
    youtubeId: '5h3y5t5c9hM',
    title: 'Check It Out',
    artist: 'Parmish Verma, Paradox',
    album: 'Check It Out Single',
    playlistId: 'punjabi-hits',
    duration: '3:08',
    durationSec: 188,
    bpm: 110,
    style: 'pop_dance',
    scale: [261.63, 293.66, 349.23, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/5h3y5t5c9hM/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: '[Club Punjabi Groove]' },
      { time: 15, text: 'Check it out gaddi di speed' }
    ]
  },
  {
    id: 'hit-still-rollin',
    youtubeId: 'Gz3F8B3e1cE',
    title: 'Still Rollin',
    artist: 'Shubh',
    album: 'Still Rollin EP',
    playlistId: 'punjabi-hits',
    duration: '2:54',
    durationSec: 174,
    bpm: 104,
    style: 'synthwave',
    scale: [261.63, 293.66, 349.23, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/Gz3F8B3e1cE/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: '[Shubh Signature Trap Beats]' },
      { time: 14, text: 'We still rollin on the high road' }
    ]
  },
  {
    id: 'hit-king-shit',
    youtubeId: '7k3T1n8f6_8',
    title: 'King Shit',
    artist: 'Shubh',
    album: 'Still Rollin',
    playlistId: 'punjabi-hits',
    duration: '3:46',
    durationSec: 226,
    bpm: 100,
    style: 'cyberpunk',
    scale: [261.63, 293.66, 349.23, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/7k3T1n8f6_8/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: '[Deep Heavy Sub-Bass]' },
      { time: 16, text: 'Royal blood doing king shit' }
    ]
  },
  {
    id: 'hit-you-and-me',
    youtubeId: '2Z0p1hL6y2U',
    title: 'You and Me',
    artist: 'Shubh',
    album: 'You and Me Single',
    playlistId: 'punjabi-hits',
    duration: '2:56',
    durationSec: 176,
    bpm: 108,
    style: 'synthwave',
    scale: [261.63, 293.66, 349.23, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/2Z0p1hL6y2U/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: '[Vibrant Summer Trap Wave]' },
      { time: 14, text: 'Just you and me under the stars' }
    ]
  },
  {
    id: 'hit-with-you',
    youtubeId: 'dCmp56tSSmA',
    title: 'With You',
    artist: 'AP Dhillon',
    album: 'With You Single',
    playlistId: 'punjabi-hits',
    duration: '2:34',
    durationSec: 154,
    bpm: 112,
    style: 'pop_dance',
    scale: [261.63, 293.66, 349.23, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/dCmp56tSSmA/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: '[Romantic Upbeat Guitar Flow]' },
      { time: 12, text: 'Tere naal zindagani haseen' }
    ]
  },
  {
    id: 'hit-true-stories',
    youtubeId: '4ZpT7t7a0_8',
    title: 'True Stories',
    artist: 'AP Dhillon, Shinda Kahlon',
    album: 'True Stories Single',
    playlistId: 'punjabi-hits',
    duration: '2:48',
    durationSec: 168,
    bpm: 105,
    style: 'synthwave',
    scale: [261.63, 293.66, 349.23, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/4ZpT7t7a0_8/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: '[Chill Indo-Canadian Groove]' },
      { time: 15, text: 'True stories written in the vibe' }
    ]
  },
  {
    id: 'hit-please-please',
    youtubeId: 'cF1Na4AIecM',
    title: 'Please Please Please',
    artist: 'Sabrina Carpenter',
    album: 'Short n Sweet',
    playlistId: 'top-hits',
    duration: '3:06',
    durationSec: 186,
    bpm: 133,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 349.23, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/cF1Na4AIecM/hqdefault.jpg',
    color: '#1e3264',
    liked: false,
    lyrics: [
      { time: 0, text: '[Retro Country-Pop Groove]' },
      { time: 12, text: 'Please please please dont prove em right' }
    ]
  },
  {
    id: 'hit-taste',
    youtubeId: 'T62mEIvC8iA',
    title: 'Taste',
    artist: 'Sabrina Carpenter',
    album: 'Short n Sweet',
    playlistId: 'top-hits',
    duration: '2:37',
    durationSec: 157,
    bpm: 113,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 349.23, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/T62mEIvC8iA/hqdefault.jpg',
    color: '#1e3264',
    liked: false,
    lyrics: [
      { time: 0, text: '[Catchy Indie Pop Anthemic Chords]' },
      { time: 14, text: 'Youll just have to taste me when he kisses you' }
    ]
  },
  {
    id: 'hit-good-luck-babe',
    youtubeId: '1RKqOmSkGgM',
    title: 'Good Luck, Babe!',
    artist: 'Chappell Roan',
    album: 'Good Luck Babe Single',
    playlistId: 'top-hits',
    duration: '3:38',
    durationSec: 218,
    bpm: 118,
    style: 'synthwave',
    scale: [261.63, 293.66, 329.63, 349.23, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/1RKqOmSkGgM/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: '[Glorious 80s Synth-Pop Rise]' },
      { time: 18, text: 'Youd have to stop the world just to stop the feeling' }
    ]
  },
  {
    id: 'hit-moonlight-sonata',
    youtubeId: '4xDzrJKXOOY',
    title: 'Moonlight Sonata Lofi',
    artist: 'Chill Beats',
    album: 'Classical Lofi Chill',
    playlistId: 'peaceful-piano',
    duration: '4:20',
    durationSec: 260,
    bpm: 72,
    style: 'lofi',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/4xDzrJKXOOY/hqdefault.jpg',
    color: '#ba5d07',
    liked: false,
    lyrics: [
      { time: 0, text: '[Peaceful Classical Piano Meets Warm Lofi]' },
      { time: 40, text: 'Deep midnight relaxation and atmospheric serenity' }
    ]
  },
  {
    id: 'hit-die-with-a-smile',
    youtubeId: 'kPa7bsKwL-8',
    title: 'Die With A Smile',
    artist: 'Lady Gaga, Bruno Mars',
    album: 'Die With A Smile',
    playlistId: 'top-hits',
    duration: '4:11',
    durationSec: 251,
    bpm: 104,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    cover: 'https://i.ytimg.com/vi/kPa7bsKwL-8/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: 'Ooh, if the world was ending' },
      { time: 25, text: "I'd wanna be next to you" }
    ]
  },
  {
    id: 'hit-birds-of-a-feather',
    youtubeId: 'd5gf9dXbPi0',
    title: 'Birds of a Feather',
    artist: 'Billie Eilish',
    album: 'HIT ME HARD AND SOFT',
    playlistId: 'top-hits',
    duration: '3:30',
    durationSec: 210,
    bpm: 105,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    cover: 'https://i.ytimg.com/vi/d5gf9dXbPi0/hqdefault.jpg',
    color: '#1e3264',
    liked: false,
    lyrics: [
      { time: 0, text: "I want you to stay, 'til I'm in the grave" },
      { time: 20, text: "'Til I rot away, dead and buried" }
    ]
  },
  {
    id: 'hit-cruel-summer',
    youtubeId: 'ic8j13piAhQ',
    title: 'Cruel Summer',
    artist: 'Taylor Swift',
    album: 'Lover',
    playlistId: 'top-hits',
    duration: '2:58',
    durationSec: 178,
    bpm: 170,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    cover: 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg',
    color: '#e13300',
    liked: false,
    lyrics: [
      { time: 0, text: "Fever dream high in the quiet of the night" },
      { time: 20, text: "You know that I caught it (Oh yeah, you're right, I want it)" }
    ]
  },
  {
    id: 'hit-as-it-was',
    youtubeId: 'H5v3kku4y6Q',
    title: 'As It Was',
    artist: 'Harry Styles',
    album: "Harry's House",
    playlistId: 'top-hits',
    duration: '2:47',
    durationSec: 167,
    bpm: 174,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    cover: 'https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg',
    color: '#1ed760',
    liked: false,
    lyrics: [
      { time: 0, text: "Holdin' me back, gravity's holdin' me back" },
      { time: 22, text: "You know it's not the same as it was" }
    ]
  },
  {
    id: 'hit-sunflower',
    youtubeId: 'ApXoWvfEYVU',
    title: 'Sunflower',
    artist: 'Post Malone, Swae Lee',
    album: 'Spider-Man: Into the Spider-Verse',
    playlistId: 'top-hits',
    duration: '2:38',
    durationSec: 158,
    bpm: 90,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    cover: 'https://i.ytimg.com/vi/ApXoWvfEYVU/hqdefault.jpg',
    color: '#f59e0b',
    liked: false,
    lyrics: [
      { time: 0, text: "Needless to say, I keep in check" },
      { time: 18, text: "Then you're left in the dust, unless I stuck by ya" }
    ]
  },
  {
    id: 'hit-believer',
    youtubeId: '7wtfhZwyrcc',
    title: 'Believer',
    artist: 'Imagine Dragons',
    album: 'Evolve',
    playlistId: 'top-hits',
    duration: '3:24',
    durationSec: 204,
    bpm: 125,
    style: 'cyberpunk',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    cover: 'https://i.ytimg.com/vi/7wtfhZwyrcc/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: "First things first, I'ma say all the words inside my head" },
      { time: 24, text: "Pain! You made me a, you made me a believer, believer" }
    ]
  },
  {
    id: 'hit-save-your-tears',
    youtubeId: 'XXYlFuWEuKI',
    title: 'Save Your Tears',
    artist: 'The Weeknd',
    album: 'After Hours',
    playlistId: 'top-hits',
    duration: '3:35',
    durationSec: 215,
    bpm: 118,
    style: 'synthwave',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    cover: 'https://i.ytimg.com/vi/XXYlFuWEuKI/hqdefault.jpg',
    color: '#e13300',
    liked: false,
    lyrics: [
      { time: 0, text: "I saw you dancing in a crowded room" },
      { time: 20, text: "You look so happy when I'm not with you" }
    ]
  },
  {
    id: 'hit-shape-of-you',
    youtubeId: 'JGwWNGJdvx8',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: 'Divide',
    playlistId: 'top-hits',
    duration: '3:53',
    durationSec: 233,
    bpm: 96,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    cover: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg',
    color: '#1e3264',
    liked: false,
    lyrics: [
      { time: 0, text: "The club isn't the best place to find a lover" },
      { time: 20, text: "I'm in love with the shape of you" }
    ]
  },
  {
    id: 'hit-perfect',
    youtubeId: '2Vv-BfVoq4g',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    album: 'Divide',
    playlistId: 'top-hits',
    duration: '4:23',
    durationSec: 263,
    bpm: 95,
    style: 'ambient',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    cover: 'https://i.ytimg.com/vi/2Vv-BfVoq4g/hqdefault.jpg',
    color: '#10b981',
    liked: false,
    lyrics: [
      { time: 0, text: "I found a love for me" },
      { time: 25, text: "Darling, just dive right in and follow my lead" }
    ]
  },
  {
    id: 'bolly-satranga',
    youtubeId: 'hrMo3BPY2rg',
    title: 'Satranga',
    artist: 'Arijit Singh, Shreyas Puranik',
    album: 'Animal',
    playlistId: 'bollywood-butter',
    duration: '4:31',
    durationSec: 271,
    bpm: 92,
    style: 'ambient',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    cover: 'https://i.ytimg.com/vi/hrMo3BPY2rg/hqdefault.jpg',
    color: '#e13300',
    liked: false,
    lyrics: [
      { time: 0, text: "Pehle bhi main tumse mila hoon" },
      { time: 20, text: "Duniya chhod doon main tere liye" }
    ]
  },
  {
    id: 'bolly-raataan-lambiyan',
    youtubeId: 'gvyUuxdRdR4',
    title: 'Raataan Lambiyan',
    artist: 'Jubin Nautiyal, Asees Kaur',
    album: 'Shershaah',
    playlistId: 'bollywood-butter',
    duration: '3:50',
    durationSec: 230,
    bpm: 96,
    style: 'ambient',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    cover: 'https://i.ytimg.com/vi/gvyUuxdRdR4/hqdefault.jpg',
    color: '#10b981',
    liked: false,
    lyrics: [
      { time: 0, text: "Teri meri gallan ho gayi mashhoor" },
      { time: 20, text: "Kar na kabhi tu mujhe nazron se door" }
    ]
  },
  {
    id: 'bolly-agar-tum-saath-ho',
    youtubeId: 'sK7riqg2mr4',
    title: 'Agar Tum Saath Ho',
    artist: 'Alka Yagnik, Arijit Singh',
    album: 'Tamasha',
    playlistId: 'bollywood-butter',
    duration: '5:41',
    durationSec: 341,
    bpm: 88,
    style: 'ambient',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    cover: 'https://i.ytimg.com/vi/sK7riqg2mr4/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: "Pal bhar thehar jaao, dil ye sambhal jaaye" },
      { time: 25, text: "Tere bin ab na lenge ek bhi dam" }
    ]
  },
  {
    id: 'bolly-ve-kamleya',
    youtubeId: 'cAqm5f3N0vA',
    title: 'Ve Kamleya',
    artist: 'Arijit Singh, Shreya Ghoshal',
    album: 'Rocky Aur Rani Kii Prem Kahaani',
    playlistId: 'bollywood-butter',
    duration: '4:07',
    durationSec: 247,
    bpm: 95,
    style: 'ambient',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    cover: 'https://i.ytimg.com/vi/cAqm5f3N0vA/hqdefault.jpg',
    color: '#f59e0b',
    liked: false,
    lyrics: [
      { time: 0, text: "Ve kamleya, ve kamleya" },
      { time: 25, text: "Kyun daata mera azaab hua re" }
    ]
  },
  {
    id: 'bolly-channa-mereya',
    youtubeId: '284Ov7ysmfA',
    title: 'Channa Mereya',
    artist: 'Arijit Singh, Pritam',
    album: 'Ae Dil Hai Mushkil',
    playlistId: 'bollywood-butter',
    duration: '4:49',
    durationSec: 289,
    bpm: 90,
    style: 'ambient',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    cover: 'https://i.ytimg.com/vi/284Ov7ysmfA/hqdefault.jpg',
    color: '#e13300',
    liked: false,
    lyrics: [
      { time: 0, text: "Achha chalta hoon, duaon mein yaad rakhna" },
      { time: 30, text: "Andhera tera maine le liya, mera ujla sitaara tere naam kiya" }
    ]
  },
  {
    id: 'bolly-kabira',
    youtubeId: 'jHNNMj5bNQw',
    title: 'Kabira',
    artist: 'Tochi Raina, Rekha Bhardwaj',
    album: 'Yeh Jawaani Hai Deewani',
    playlistId: 'bollywood-butter',
    duration: '3:43',
    durationSec: 223,
    bpm: 104,
    style: 'ambient',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    cover: 'https://i.ytimg.com/vi/jHNNMj5bNQw/hqdefault.jpg',
    color: '#10b981',
    liked: false,
    lyrics: [
      { time: 0, text: "Banno re banno meri chali sasuraal ko" },
      { time: 25, text: "Kaisi judaai hai yeh, aankh bhar aayi hai" }
    ]
  },
  {
    id: 'bolly-husn',
    youtubeId: 'gVYrPswp_80',
    title: 'Husn',
    artist: 'Anuv Jain',
    album: 'Husn Single',
    playlistId: 'bollywood-butter',
    duration: '3:38',
    durationSec: 218,
    bpm: 98,
    style: 'ambient',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    cover: 'https://i.ytimg.com/vi/gVYrPswp_80/hqdefault.jpg',
    color: '#8b5cf6',
    liked: false,
    lyrics: [
      { time: 0, text: "Dekho dekho kaisi baatein yahan ki" },
      { time: 25, text: "Hai husn tera par hum nahi tere" }
    ]
  },
  {
    id: 'bolly-jo-tum-mere-ho',
    youtubeId: 'ilNt2bikxwc',
    title: 'Jo Tum Mere Ho',
    artist: 'Anuv Jain',
    album: 'Jo Tum Mere Ho',
    playlistId: 'bollywood-butter',
    duration: '4:11',
    durationSec: 251,
    bpm: 96,
    style: 'ambient',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    cover: 'https://i.ytimg.com/vi/ilNt2bikxwc/hqdefault.jpg',
    color: '#f59e0b',
    liked: false,
    lyrics: [
      { time: 0, text: "Jo tum mere ho, to main kisi aur ka kyun rahoon" },
      { time: 30, text: "Saari khushiyan tere sang ho" }
    ]
  },
  {
    id: 'bolly-kun-faya-kun',
    youtubeId: 'T94PHkuydcw',
    title: 'Kun Faya Kun',
    artist: 'A.R. Rahman, Mohit Chauhan, Javed Ali',
    album: 'Rockstar',
    playlistId: 'bollywood-butter',
    duration: '7:53',
    durationSec: 473,
    bpm: 84,
    style: 'ambient',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    cover: 'https://i.ytimg.com/vi/T94PHkuydcw/hqdefault.jpg',
    color: '#0d9488',
    liked: false,
    lyrics: [
      { time: 0, text: "Kun faya kun, kun faya kun" },
      { time: 35, text: "Jab kahin pe kuch nahi bhi nahi tha" }
    ]
  },
  {
    id: 'punjabi-brown-munde',
    youtubeId: 'VNs_cCtdbPc',
    title: 'Brown Munde',
    artist: 'AP Dhillon, Gurinder Gill, Shinda Kahlon',
    album: 'Brown Munde Single',
    playlistId: 'punjabi-hits',
    duration: '4:28',
    durationSec: 268,
    bpm: 104,
    style: 'cyberpunk',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    cover: 'https://i.ytimg.com/vi/VNs_cCtdbPc/hqdefault.jpg',
    color: '#e13300',
    liked: false,
    lyrics: [
      { time: 0, text: "Desi je geet aa trap jehi beat aa" },
      { time: 25, text: "Khaan peen jatt da shahi lifestyle aa, Brown Munde" }
    ]
  },
  {
    id: 'punjabi-excuses',
    youtubeId: 'vX2cDW8LUWk',
    title: 'Excuses',
    artist: 'AP Dhillon, Gurinder Gill',
    album: 'Hidden Gems',
    playlistId: 'punjabi-hits',
    duration: '2:56',
    durationSec: 176,
    bpm: 110,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    cover: 'https://i.ytimg.com/vi/vX2cDW8LUWk/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: "Kehndi hundi si chann tak raah bana de" },
      { time: 20, text: "Taare ne pasand mainu hethaan saare laade" }
    ]
  },
  {
    id: 'punjabi-lover',
    youtubeId: 'mH_LFuy8m4o',
    title: 'Lover',
    artist: 'Diljit Dosanjh, Intense',
    album: 'MoonChild Era',
    playlistId: 'punjabi-hits',
    duration: '3:05',
    durationSec: 185,
    bpm: 120,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    cover: 'https://i.ytimg.com/vi/mH_LFuy8m4o/hqdefault.jpg',
    color: '#1ed760',
    liked: false,
    lyrics: [
      { time: 0, text: "Tera ni main, tera ni main lover" },
      { time: 20, text: "Dil le gaya, le gaya, le gaya" }
    ]
  },
  {
    id: 'punjabi-baller',
    youtubeId: 'wFk_vyz_bCs',
    title: 'Baller',
    artist: 'Shubh, Ikky',
    album: 'Baller Single',
    playlistId: 'punjabi-hits',
    duration: '2:28',
    durationSec: 148,
    bpm: 110,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    cover: 'https://i.ytimg.com/vi/wFk_vyz_bCs/hqdefault.jpg',
    color: '#e13300',
    liked: false,
    lyrics: [
      { time: 0, text: "Gaddi saddi billo speed chali jaandi" },
      { time: 18, text: "Gall sun mutiyaare, we are big ballers" }
    ]
  },
  {
    id: 'punjabi-elevated',
    youtubeId: 'k1-TrAv4gEQ',
    title: 'Elevated',
    artist: 'Shubh',
    album: 'Still Rollin',
    playlistId: 'punjabi-hits',
    duration: '3:20',
    durationSec: 200,
    bpm: 104,
    style: 'pop_dance',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    cover: 'https://i.ytimg.com/vi/k1-TrAv4gEQ/hqdefault.jpg',
    color: '#1e3264',
    liked: false,
    lyrics: [
      { time: 0, text: "Koka paake billo aayi ae bazaar ch" },
      { time: 25, text: "Gabbru da dil phire tere piche haarda" }
    ]
  },
  {
    id: 'punjabi-so-high',
    youtubeId: 'GgmFC83WH7g',
    title: 'So High',
    artist: 'Sidhu Moose Wala, BYG BYRD',
    album: 'PBX 1',
    playlistId: 'punjabi-hits',
    duration: '3:54',
    durationSec: 234,
    bpm: 98,
    style: 'cyberpunk',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    cover: 'https://i.ytimg.com/vi/GgmFC83WH7g/hqdefault.jpg',
    color: '#8400e7',
    liked: false,
    lyrics: [
      { time: 0, text: "Geetkari te na aaji kitte gabbru" },
      { time: 25, text: "Sir utte aunda ae ni naam gabbru da, So High" }
    ]
  },
  {
    id: 'punjabi-same-beef',
    youtubeId: '1w7DgK4K3i8',
    title: 'Same Beef',
    artist: 'Sidhu Moose Wala, Bohemia',
    album: 'Same Beef Single',
    playlistId: 'punjabi-hits',
    duration: '4:35',
    durationSec: 275,
    bpm: 96,
    style: 'cyberpunk',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    cover: 'https://i.ytimg.com/vi/1w7DgK4K3i8/hqdefault.jpg',
    color: '#e13300',
    liked: false,
    lyrics: [
      { time: 0, text: "Oh vekh jatt nu, vekh jatt nu" },
      { time: 30, text: "Ajj vi ae same beef, ohi billo cheej" }
    ]
  },
  {
    id: 'hit-experience',
    youtubeId: 'hN_q-_nGv4U',
    title: 'Experience',
    artist: 'Ludovico Einaudi',
    album: 'In A Time Lapse',
    playlistId: 'peaceful-piano',
    duration: '5:15',
    durationSec: 315,
    bpm: 88,
    style: 'lofi',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/hN_q-_nGv4U/hqdefault.jpg',
    color: '#0d9488',
    liked: false,
    lyrics: [
      { time: 0, text: '[Emotional Cinematic Strings & Grand Piano]' },
      { time: 60, text: 'Building orchestral crescendo of pure euphoria' }
    ]
  },
  {
    id: 'bhakti-parvati-song',
    youtubeId: 'xPqG3yVfS2o',
    title: 'Parvati Song | Jab Zid Pe Aa Gayi Parvati',
    artist: 'Sadhu Tiwari, Hanuman Ansh',
    album: 'Divine Mahadev Stuti',
    playlistId: 'devotional-spiritual',
    duration: '4:40',
    durationSec: 280,
    bpm: 96,
    style: 'acoustic',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/xPqG3yVfS2o/hqdefault.jpg',
    color: '#f97316',
    liked: false,
    lyrics: [
      { time: 10, text: 'जब ज़िद पे आ गई पार्वती' },
      { time: 14.5, text: 'भोले को मना के छोड़ेगी' },
      { time: 19, text: 'पार्वती बोली शंकर से' },
      { time: 23.5, text: 'भांग तुम्हारी नहीं पिसती' },
      { time: 28, text: 'जब ज़िद पे आ गई पार्वती' },
      { time: 32.5, text: 'भोले को मना के छोड़ेगी' },
      { time: 37, text: 'डमरू की धुन पे नाचेगी' },
      { time: 41.5, text: 'भोले को रिझा के छोड़ेगी' },
      { time: 46, text: 'हर हर शंभू, हर हर महादेव' },
      { time: 50.5, text: 'जय जय शिव शंभू, जय महाकाल' }
    ]
  },
  {
    id: 'bhakti-namo-namo',
    youtubeId: 'dx4Teh-nv3A',
    title: 'Namo Namo - Kedarnath',
    artist: 'Amit Trivedi',
    album: 'Kedarnath',
    playlistId: 'devotional-spiritual',
    duration: '5:22',
    durationSec: 322,
    bpm: 104,
    style: 'acoustic',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/dx4Teh-nv3A/hqdefault.jpg',
    color: '#ea580c',
    liked: false,
    lyrics: [
      { time: 18, text: 'जय हो जय हो शंकरा, आदिदेव शंकरा' },
      { time: 28, text: 'हे शिवाय शंकरा, नमो नमो शंकरा' },
      { time: 38, text: 'चंद्रमौली शंकरा, व्याघ्रचर्म शंकरा' }
    ]
  },
  {
    id: 'bhakti-bholenath-ji',
    youtubeId: 'j8Y_G1S3s0c',
    title: 'O Bholenath Ji',
    artist: 'Hansraj Raghuwanshi',
    album: 'Shiv Kailash Ke Wasi',
    playlistId: 'devotional-spiritual',
    duration: '4:15',
    durationSec: 255,
    bpm: 92,
    style: 'acoustic',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/j8Y_G1S3s0c/hqdefault.jpg',
    color: '#f59e0b',
    liked: false,
    lyrics: [
      { time: 12, text: 'ओ भोलेनाथ जी, मेरे भोलेनाथ जी' },
      { time: 22, text: 'हम तो हैं तेरे दीवाने, भोले तेरे दर पे आए' }
    ]
  },
  {
    id: 'bhakti-hanuman-chalisa',
    youtubeId: 'AETFvQonfV8',
    title: 'Shri Hanuman Chalisa',
    artist: 'Hariharan, Gulshan Kumar',
    album: 'Shree Hanuman Chalisa',
    playlistId: 'devotional-spiritual',
    duration: '9:48',
    durationSec: 588,
    bpm: 80,
    style: 'acoustic',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/AETFvQonfV8/hqdefault.jpg',
    color: '#c2410c',
    liked: false,
    lyrics: [
      { time: 35, text: 'जय हनुमान ज्ञान गुन सागर' },
      { time: 42, text: 'जय कपीस तिहुं लोक उजागर' },
      { time: 49, text: 'रामदूत अतुलित बल धामा' },
      { time: 56, text: 'अंजनि-पुत्र पवनसुत नामा' }
    ]
  },
  {
    id: 'bhakti-shiv-tandav',
    youtubeId: 'hMBKmQEPNzI',
    title: 'Shiv Tandav Stotram',
    artist: 'Shankar Mahadevan',
    album: 'Devon Ke Dev Mahadev',
    playlistId: 'devotional-spiritual',
    duration: '9:12',
    durationSec: 552,
    bpm: 112,
    style: 'acoustic',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/hMBKmQEPNzI/hqdefault.jpg',
    color: '#f97316',
    liked: false,
    lyrics: [
      { time: 10, text: 'जटाटवीगलज्जलप्रवाहपावितस्थले' },
      { time: 20, text: 'गलेऽवलम्ब्य लम्बितां भुजङ्गतुङ्गमालिकाम्' },
      { time: 30, text: 'डमड्डमड्डमड्डमन्निनादवड्डमर्वयं' },
      { time: 40, text: 'चकार चण्डताण्डवं तनोतु नः शिवः शिवम्' }
    ]
  },
  {
    id: 'bhakti-har-har-shambhu',
    youtubeId: 'u4i735i0z6w',
    title: 'Har Har Shambhu Shiv Mahadeva',
    artist: 'Abhilipsa Panda, Jeetu Sharma',
    album: 'Shiv Mahadeva',
    playlistId: 'devotional-spiritual',
    duration: '5:48',
    durationSec: 348,
    bpm: 105,
    style: 'acoustic',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/u4i735i0z6w/hqdefault.jpg',
    color: '#ea580c',
    liked: false,
    lyrics: [
      { time: 15, text: 'हर हर शंभू शंभू शंभू' },
      { time: 22, text: 'शंभू शिव महादेवा' },
      { time: 30, text: 'कर्पूरगौरं करुणावतारं' },
      { time: 38, text: 'संसारसारं भुजगेन्द्रहारम्' }
    ]
  },
  {
    id: 'bhakti-mere-ghar-ram',
    youtubeId: '7R4bK_G2k4A',
    title: 'Mere Ghar Ram Aaye Hain',
    artist: 'Jubin Nautiyal',
    album: 'Ram Aaye Hain',
    playlistId: 'devotional-spiritual',
    duration: '4:30',
    durationSec: 270,
    bpm: 90,
    style: 'acoustic',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/7R4bK_G2k4A/hqdefault.jpg',
    color: '#f59e0b',
    liked: false,
    lyrics: [
      { time: 12, text: 'मेरी चौखट पे चलके आज' },
      { time: 20, text: 'चारों धाम आए हैं' },
      { time: 28, text: 'बजाओ ढोल स्वागत में' },
      { time: 35, text: 'मेरे घर राम आए हैं' }
    ]
  },
  {
    id: 'bhakti-kaal-ujjain',
    youtubeId: 'zQ9Q1W8x0sQ',
    title: 'Kaal Ke Ujjain Ke Raja',
    artist: 'Hansraj Raghuwanshi',
    album: 'Mahakaal Ujjain',
    playlistId: 'devotional-spiritual',
    duration: '4:42',
    durationSec: 282,
    bpm: 98,
    style: 'acoustic',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/zQ9Q1W8x0sQ/hqdefault.jpg',
    color: '#c2410c',
    liked: false,
    lyrics: [
      { time: 14, text: 'महाकाल के दीवाने हैं' },
      { time: 22, text: 'उज्जैन के राजा महाकाल' },
      { time: 30, text: 'काल भी उसका क्या बिगाड़े' },
      { time: 38, text: 'जो भक्त हो महाकाल का' }
    ]
  },
  {
    id: 'bhakti-radhe-barsane',
    youtubeId: '4B3a8L-P90E',
    title: 'Radhe Radhe Radhe Barsane Wali Radhe',
    artist: 'Gaurav Krishna Goswami',
    album: 'Barsane Wali Radhe',
    playlistId: 'devotional-spiritual',
    duration: '7:15',
    durationSec: 435,
    bpm: 102,
    style: 'acoustic',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/4B3a8L-P90E/hqdefault.jpg',
    color: '#f97316',
    liked: false,
    lyrics: [
      { time: 15, text: 'राधे राधे राधे बरसाने वाली राधे' },
      { time: 25, text: 'वृन्दावन में राधे राधे' },
      { time: 35, text: 'बरसाने में राधे राधे' }
    ]
  },
  {
    id: 'bhakti-achyutam-keshavam',
    youtubeId: '9U_0S_8b05A',
    title: 'Achyutam Keshavam',
    artist: 'Shreya Ghoshal',
    album: 'Krishna Bhajans',
    playlistId: 'devotional-spiritual',
    duration: '5:10',
    durationSec: 310,
    bpm: 88,
    style: 'acoustic',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/9U_0S_8b05A/hqdefault.jpg',
    color: '#ea580c',
    liked: false,
    lyrics: [
      { time: 12, text: 'अच्युतम केशवं कृष्ण दामोदरं' },
      { time: 22, text: 'राम नारायणं जानकी वल्लभम्' },
      { time: 32, text: 'कौन कहते हैं भगवान आते नहीं' },
      { time: 42, text: 'तुम मीरा के जैसे बुलाते नहीं' }
    ]
  },
  {
    id: 'bhakti-ram-siya-ram',
    youtubeId: '4oE89cT5K_g',
    title: 'Ram Siya Ram',
    artist: 'Sachet-Parampara',
    album: 'Adipurush',
    playlistId: 'devotional-spiritual',
    duration: '3:50',
    durationSec: 230,
    bpm: 85,
    style: 'acoustic',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/4oE89cT5K_g/hqdefault.jpg',
    color: '#f59e0b',
    liked: false,
    lyrics: [
      { time: 10, text: 'राम सिया राम, सिया राम, जय जय राम' },
      { time: 20, text: 'राम सिया राम, सिया राम, जय जय राम' }
    ]
  },
  {
    id: 'bhakti-shiv-kailash',
    youtubeId: 'm4XJm5R6j7Y',
    title: 'Shiv Kailash Ke Vasi',
    artist: 'Hansraj Raghuwanshi',
    album: 'Shiv Stuti',
    playlistId: 'devotional-spiritual',
    duration: '5:30',
    durationSec: 330,
    bpm: 90,
    style: 'acoustic',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/m4XJm5R6j7Y/hqdefault.jpg',
    color: '#c2410c',
    liked: false,
    lyrics: [
      { time: 12, text: 'शिव कैलाशों के वासी, धौली धारों के राजा' },
      { time: 22, text: 'शंकर संकट हरना' }
    ]
  },
  {
    id: 'indie-majboor',
    youtubeId: 'qB5fR5h6k7l',
    title: 'Majboor',
    artist: 'Sheheryar Rehan x Zoha Waseem',
    album: 'Majboor Acoustic',
    playlistId: 'bollywood-central',
    duration: '2:38',
    durationSec: 158,
    bpm: 90,
    style: 'acoustic',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0],
    cover: 'https://i.ytimg.com/vi/qB5fR5h6k7l/hqdefault.jpg',
    color: '#e13300',
    liked: false,
    lyrics: [
      { time: 10, text: 'Dil se jo baatein thi kehni' },
      { time: 14.5, text: 'Aankhon mein aansu bann beh gayi' },
      { time: 19, text: 'Hum toh the tere deewane' },
      { time: 23.5, text: 'Tu kyun majboor ho gayi' },
      { time: 28, text: 'Kaisi ye dooriyan, kaisi majbooriyan' },
      { time: 32.5, text: 'Tu bhi hai royi, main bhi hoon roya' }
    ]
  }
];

export function getSavedPlaylistTracks(savedStreams: SavedStream[]): ResonixTrack[] {
  return savedStreams.map((stream, idx) => ({
    id: 'saved-track-' + stream.id,
    title: stream.title || 'Saved Track #' + (idx + 1),
    artist: stream.artist || 'Spotify Artist',
    album: 'My Saved Playlist',
    playlistId: 'saved-playlist',
    duration: '3:30',
    durationSec: 210,
    bpm: 110,
    style: 'pop_dance' as const,
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    cover: stream.cover || 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84c61decc5a2592bcbf090bea8',
    color: '#1ed760',
    liked: false,
    isRealSpotify: true,
    spotifyUri: stream.url,
    lyrics: [{ time: 0, text: 'Streaming directly from Spotify...' }]
  }));
}

const STORAGE_KEY = 'whushh_saved_streams_v2';

export const getSavedStreams = (): SavedStream[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaultStreams: SavedStream[] = [
        {
          id: '3ZljLLEiktD5EDxXjxLcVT',
          url: 'https://open.spotify.com/playlist/3ZljLLEiktD5EDxXjxLcVT',
          title: 'whushh',
          type: 'playlist',
          playedAt: new Date().toLocaleDateString(),
          cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84c61decc5a2592bcbf090bea8',
          artist: 'Dikshu • whushh'
        }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultStreams));
      return defaultStreams;
    }
    const parsed = JSON.parse(raw);
    const valid: SavedStream[] = Array.isArray(parsed)
      ? parsed.filter(item => item && item.url && !item.url.includes('spotify.link') && !item.url.includes('2a3c77...'))
      : [];
    if (!valid.some(item => item.url && item.url.includes('3ZljLLEiktD5EDxXjxLcVT'))) {
      valid.unshift({
        id: '3ZljLLEiktD5EDxXjxLcVT',
        url: 'https://open.spotify.com/playlist/3ZljLLEiktD5EDxXjxLcVT',
        title: 'whushh',
        type: 'playlist',
        playedAt: new Date().toLocaleDateString(),
        cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84c61decc5a2592bcbf090bea8',
        artist: 'Dikshu • whushh'
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    }
    return valid;
  } catch {
    return [];
  }
};

export const saveStreamItem = (url: string, title?: string, cover?: string, artist?: string): SavedStream => {
  const existing = getSavedStreams();
  const type = url.includes('/playlist/') ? 'playlist' : url.includes('/album/') ? 'album' : 'track';
  const displayTitle = title || (type === 'playlist' ? 'Saved Playlist' : 'Saved Song');
  
  let embedId = url.trim();
  const match = url.match(/\/(playlist|track|album|artist)\/([a-zA-Z0-9]+)/);
  if (match && match[2]) {
    embedId = match[2];
  }

  const newItem: SavedStream = {
    id: embedId,
    url: url.trim(),
    title: displayTitle,
    type,
    playedAt: new Date().toLocaleDateString(),
    cover: cover || undefined,
    artist: artist || undefined
  };
  const filtered = existing.filter(i => i.url !== newItem.url && i.id !== newItem.id);
  const updated = [newItem, ...filtered].slice(0, 30);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return newItem;
};

export const clearSavedStreams = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
};

export const updateStreamMetadata = (url: string, title: string, cover?: string, artist?: string): void => {
  try {
    const list = getSavedStreams();
    const updated = list.map(item => {
      if (item.url === url || item.id === url || url.includes(item.id)) {
        return {
          ...item,
          title: title || item.title,
          cover: cover || item.cover,
          artist: artist || item.artist
        };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
};

export const setLocalSavedStreams = (streams: SavedStream[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(streams));
  } catch {}
};

export const deleteLocalStreamItem = (id: string): SavedStream[] => {
  try {
    const existing = getSavedStreams();
    const updated = existing.filter((item) => item.id !== id && !item.url.includes(id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};
