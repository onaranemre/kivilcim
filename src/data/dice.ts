export type DieId = 'style' | 'emotion' | 'rule' | 'perspective' | 'word'

export interface DieMeta {
  id: DieId
  title: string
  /** Kart boşken görünen kısa, gizemli ipucu. */
  hint: string
  /** Kelime zarı gibi tek atışta birden fazla sonuç verenler için. */
  draw?: number
}

export const DICE: DieMeta[] = [
  { id: 'style', title: 'Tarz', hint: 'Şarkı neye benzesin?' },
  { id: 'emotion', title: 'Duygu', hint: 'Nereden besleniyor?' },
  { id: 'rule', title: 'Kural', hint: 'Kendine bir sınır çiz.' },
  { id: 'perspective', title: 'Perspektif', hint: 'Kimin ağzından?' },
  { id: 'word', title: 'Kelime', hint: 'Üç kelime. Kaçış yok.', draw: 3 },
]

export const STYLES: string[] = [
  'Pop',
  'Rock',
  'Akustik',
  'Halk Müziği',
  'Arabesk',
  'Elektronik',
  'Caz',
  'Blues',
  'Funk',
  'Soul',
  'Rap',
  'R&B',
  'Balad',
  'Disko',
  'Reggae',
  'Punk',
  'Nostaljik Pop',
  'Rock Balad',
]

export const EMOTIONS: string[] = [
  'Özlem',
  'Öfke',
  'Huzur',
  'Yalnızlık',
  'Pişmanlık',
  'Kıskançlık',
  'Umut',
  'Nostalji',
  'Tükenmişlik',
  'Kırgınlık',
  'Kabullenme',
  'Coşku',
  'Utanç',
  'Merhamet',
  'Kararsızlık',
  'Vedalaşma',
]

export const RULES: string[] = [
  'Nakaratla başla',
  'Sadece iki enstrüman düşün',
  'Aynı dizeyle başla ve bitir',
  'Şarkıyı bir soruyla bitir',
  '“Ben” yerine “biz” de',
  'Her şey tek bir mekânda geçsin',
  'Bir renk mutlaka geçsin',
  'Köprüde duygu tersine dönsün',
  'İlk dizeyi en son yaz',
  'Dizeleri kısa tut',
  'Geçmiş zamanı hiç kullanma',
  'Bir mevsim ya da saat geçsin',
  'Önce melodiyi mırıldan, sözü sonra koy',
  'Nakaratta bir kelime hep tekrar etsin',
  'İsim kullanma, sadece “sen” de',
  'Tek nefeste söylenecek kadar kısa dizeler',
]

export const PERSPECTIVES: string[] = [
  'Gelecekteki sen',
  'Eski bir sevgili',
  'Çocukluğundaki sen',
  'Seni yeni tanıyan biri',
  'Mektup yazdığın kişi',
  'Şehrin gözünden',
  'Bu anı yıllar sonra hatırlayan sen',
  'Sana küskün biri',
  'Bir sırdaşın',
  'Geride bıraktığın biri',
  'Uzaktaki bir dost',
  'Sana benzeyen bir yabancı',
  'Seni bekleyen biri',
  'Vazgeçtiğin bir hayal',
]

const SOMUT: string[] = [
  'anahtar', 'pencere', 'kibrit', 'perde', 'asfalt', 'bardak', 'çakmak', 'radyo',
  'valiz', 'köprü', 'lamba', 'iskele', 'duman', 'tren', 'ceket', 'ayna', 'kaldırım',
  'telefon', 'çatı', 'peron', 'merdiven', 'yağmurluk', 'defter', 'bilet', 'saat',
  'tuz', 'çamaşır ipi', 'anahtarlık', 'fener', 'plak', 'kar', 'demir kapı',
  'çay bardağı', 'sokak lambası', 'eldiven', 'battaniye', 'harita', 'mendil',
  'peron saati', 'otobüs durağı',
]

const DUYGUSAL: string[] = [
  'boşluk', 'sığınak', 'af', 'hasret', 'kırgınlık', 'teselli', 'gurur', 'korku',
  'şefkat', 'yorgunluk', 'kıvılcım', 'kabullenme', 'güven', 'nefes', 'ağırlık',
  'huzur', 'öfke', 'utanç', 'merak', 'yalnızlık', 'umut', 'pişmanlık', 'özlem',
  'sevinç', 'tereddüt', 'sadakat', 'kayıp', 'aidiyet', 'minnet', 'kıskançlık',
  'vicdan', 'cesaret', 'yas', 'hafiflik', 'iç sıkıntısı', 'merhamet', 'kavuşma',
  'vazgeçiş', 'sabır', 'hayal kırıklığı',
]

const FIIL: string[] = [
  'kaçmak', 'unutmak', 'beklemek', 'yıkılmak', 'affetmek', 'saklanmak', 'dönmek',
  'çözülmek', 'tutunmak', 'bırakmak', 'aramak', 'susmak', 'yanmak', 'düşmek',
  'uyanmak', 'kırılmak', 'bağışlamak', 'kaybolmak', 'hatırlamak', 'vazgeçmek',
  'sarılmak', 'itiraf etmek', 'dayanmak', 'akmak', 'fısıldamak', 'toparlanmak',
  'batmak', 'yüzmek', 'çekip gitmek', 'geri dönmek', 'ışıldamak', 'titremek',
  'dağılmak', 'iz bırakmak', 'gülmek', 'savrulmak', 'direnmek', 'özlemek',
]

const SIIRSEL: string[] = [
  'alacakaranlık', 'kül', 'yankı', 'seher', 'gölge', 'kırağı', 'iz', 'liman',
  'fırtına', 'sükût', 'mehtap', 'çağlayan', 'harabe', 'ufuk', 'hüzün', 'billur',
  'mercan', 'firar', 'menzil', 'sırdaş', 'yolculuk', 'buğu', 'ayrılık',
  'sabah yıldızı', 'hicran', 'vuslat', 'gurbet', 'zaman', 'dinginlik', 'sonbahar',
  'kavis', 'çığ', 'nakış', 'közleme', 'sarnıç', 'yad', 'ıssızlık', 'şafak',
]

/** Tek karışık havuz: somut + duygusal + fiil + şiirsel. */
export const WORDS: string[] = Array.from(
  new Set([...SOMUT, ...DUYGUSAL, ...FIIL, ...SIIRSEL]),
)

export function poolFor(id: DieId): string[] {
  switch (id) {
    case 'style':
      return STYLES
    case 'emotion':
      return EMOTIONS
    case 'rule':
      return RULES
    case 'perspective':
      return PERSPECTIVES
    case 'word':
      return WORDS
  }
}
