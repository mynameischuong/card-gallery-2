import type { Card, Decklist, GameMode } from "./types";

type DecklistInput = Omit<Decklist, 'id'>;

const rawDecklists: DecklistInput[] = [
  { cardName: "Archfiend",  duelist: "Chuong", title: "Archfiend Variant 1", image: "/decklist/archfiend.PNG" },
  { cardName: "Phantasm Spiral",  duelist: "Chuong", title: "Phantasm Spiral Variant 1", image: "/decklist/phantasmSpiral.PNG" },
  { cardName: "Dark Magician",  duelist: "Chuong", title: "Dark Magician Variant 1", image: "/decklist/darkMagician.PNG" },
  { cardName: "Dark Magician",  duelist: "Chuong", title: "Dark Magician Variant 2", image: "/decklist/darkMagician2.PNG" },
  { cardName: "Eldlich",  duelist: "Chuong", title: "Eldlich Variant 1", image: "/decklist/eldlich.PNG" },
  { cardName: "Eldlich",  duelist: "Chuong", title: "Eldlich Variant 2", image: "/decklist/eldlich2.PNG" },
];

export const decklistsData: Decklist[] = rawDecklists.map((deck, index) => ({
  id: index + 1,
  ...deck,
}));

type GameModeInput = Omit<GameMode, 'id'>;

const rawModes: GameModeInput[] = [
  {
    name: 'Tournament',
    description: 'Structured tournament mode with rule enforcement and deck registration.',
    rules: 'Match win/loss tracking, restricted card list, and official prize structure.',
    //image: 'https://via.placeholder.com/800x320?text=Tournament+Mode',
  },
];

export const modesData: GameMode[] = rawModes.map((mode, index) => ({
  id: index + 1,
  ...mode,
}));

type CardInput = Omit<Card, 'id'>;

const rawCards: CardInput[] = [

  // An
  { name: "Exosister", level: 7, rarity: "rogue", locked: false, image: "/cards/exosisters.jpg", duelist: "An" },
  { name: "White Forest", level: 8, rarity: "rogue", locked: false, image: "/cards/whiteForest.jpg", duelist: "An" },
  { name: "Rescue-Ace", level: 7, rarity: "rogue", locked: false, image: "/cards/rescueAce.jpg", duelist: "An" },
  { name: "Dracotail", level: 9, rarity: "meta", locked: false, image: "/cards/dracotail.jpg", duelist: "An" },
  { name:"Artmage" , level: 8, rarity: "rogue", locked:false, image:"/cards/artmage.jpg", duelist: "An" },

  // Bao
  { name: "Floowandereeze", level: 7, rarity: "rogue", locked: false, image: "/cards/floowandereeze.jpg", duelist: "Bao" },
  { name: "Voiceless Voice", level: 7, rarity: "rogue", locked: false, image: "/cards/voicelessVoice.jpg", duelist: "Bao" },
  { name: "Exosisters", level: 7, rarity: "rogue", locked: false, image: "/cards/exosisters.jpg", duelist: "Bao" },
  { name: "k9", level: 9, rarity: "meta", locked: false, image: "/cards/k9-1.jpg", duelist: "Bao" },
  { name: "Yummy", level: 8, rarity: "rogue", locked: false, image: "/cards/yummy-1.jpg", duelist: "Bao" },
  { name: "Hecahands", level: 7, rarity: "semi-competitive", locked: false, image: "/cards/hecahands.jpg", duelist: "Bao" },
  { name: "Clown Clan", level: 8, rarity: "rogue", locked: false, image: "/cards/clownClan-1.jpg", duelist: "Bao" },

  // BaoCyberse
  { name: "Salamangreat", level: 7, rarity: "rogue", locked: false, image: "/cards/salamangreat.jpg", duelist: "BaoCyberse" },
  { name: "Maliss", level: 9, rarity: "meta", locked: false, image: "/cards/maliss.jpg", duelist: "BaoCyberse" },
  { name: "Marincess", level: 5, rarity: "semi-competitive", locked: false, image: "/cards/marincess.jpg", duelist: "BaoCyberse" },
  { name: "Math Mech", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/mathMech.jpg", duelist: "BaoCyberse" },
  { name: "Vaylantz", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/vaylantz.jpg", duelist: "BaoCyberse" },
  { name: "Memento", level: 8, rarity: "rogue", locked: false, image: "/cards/memento.jpg", duelist: "BaoCyberse" },
  { name: "Goblin Biker", level: 7, rarity: "rogue", locked: false, image: "/cards/goblinBiker.jpg", duelist: "BaoCyberse" },
  { name: "Ignister", level: 8, rarity: "rogue", locked: false, image: "/cards/ignister.jpg", duelist: "BaoCyberse" },
  { name: "Evil Twin", level: 7, rarity: "rogue", locked: false, image: "/cards/evilTwin.jpg", duelist: "BaoCyberse" },
  { name: "Doom-z", level: 8, rarity: "rogue", locked: false, image: "/cards/doomz.jpg", duelist: "BaoCyberse" },

  // Ca
  { name: "Labrynth", level: 7, rarity: "rogue", locked: false, image: "/cards/labrynth.jpg", duelist: "Ca" },
  { name: "Sky Striker", level: 9, rarity: "meta", locked: false, image: "/cards/skyStriker.jpg", duelist: "Ca" },

  // Chuong
  { name: "Ancient Warriors", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/ancientWarriors.jpg", duelist: "Chuong" },
  { name: "Apophis", level: 7, rarity: "rogue", locked: false, image: "/cards/apophis.jpg", duelist: "Chuong" },
  { name: "Arcana Force", level: 4, rarity: "casual", locked: false, image: "/cards/arcanaForce.jpg", duelist: "Chuong" },
  { name: "Archfiend", level: 7, rarity: "rogue", locked: false, image: "/cards/archfiend.jpg", duelist: "Chuong" },
  { name: "Assault Mode", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/assaultMode.jpg", duelist: "Chuong" },
  { name: "Buster Blader", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/busterBlader.jpg", duelist: "Chuong" },
  { name: "Dark Magician", level: 8, rarity: "rogue", locked: false, image: "/cards/darkMagician.jpg", duelist: "Chuong" },
  { name: "Eldlich", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/eldlich.jpg", duelist: "Chuong" },
  { name: "Evil Eye", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/evilEye.jpg", duelist: "Chuong" },
  { name: "Fabled", level: 5, rarity: "semi-competitive", locked: false, image: "/cards/fabled.jpg", duelist: "Chuong" },
  { name: "Flame Swordsman", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/flameSwordman.jpg", duelist: "Chuong" },
  { name: "Fur Hire", level: 7, rarity: "rogue", locked: false, image: "/cards/furHire.jpg", duelist: "Chuong" },
  { name: "Gate Guardian", level: 5, rarity: "semi-competitive", locked: false, image: "/cards/gateGuardian.jpg", duelist: "Chuong" },
  { name: "Gem-Knight", level: 7, rarity: "rogue", locked: false, image: "/cards/gemKnight.jpg", duelist: "Chuong" },
  { name: "Ghoti", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/ghoti.jpg", duelist: "Chuong" },
  { name: "Icejade", level: 5, rarity: "semi-competitive", locked: false, image: "/cards/icejade.jpg", duelist: "Chuong" },
  { name: "Infernoble Knight", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/infernobleKnight.jpg", duelist: "Chuong" },
  { name: "Libromancer", level: 5, rarity: "semi-competitive", locked: false, image: "/cards/libromancer.jpg", duelist: "Chuong" },
  { name: "Madolche", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/madolche.jpg", duelist: "Chuong" },
  { name: "Majespecter", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/majespecter.jpg", duelist: "Chuong" },
  { name: "Materiactor", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/materiactor.jpg", duelist: "Chuong" },
  { name: "Megalith", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/megalith.jpg", duelist: "Chuong" },
  { name: "Memento", level: 8, rarity: "rogue", locked: false, image: "/cards/memento.jpg", duelist: "Chuong" },
  { name: "Mikanko", level: 7, rarity: "rogue", locked: false, image: "/cards/mikanko.jpg", duelist: "Chuong" },
  { name: "Mimighoul", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/mimighoul.jpg", duelist: "Chuong" },
  { name: "Monarch", level: 7, rarity: "rogue", locked: false, image: "/cards/monarch.jpg", duelist: "Chuong" },
  { name: "Morganite", level: 7, rarity: "rogue", locked: false, image: "/cards/morganite.jpg", duelist: "Chuong" },
  { name: "Nemleria", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/nemleria.png", duelist: "Chuong" },
  { name: "Ninja", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/ninja.jpg", duelist: "Chuong" },
  { name: "P.U.N.K", level: 7, rarity: "rogue", locked: false, image: "/cards/p.u.n.k.jpg", duelist: "Chuong" },
  { name: "Phantasm Spiral", level: 7, rarity: "rogue", locked: false, image: "/cards/phantasmSpiral.jpg", duelist: "Chuong" },
  { name: "Predaplant", level: 8, rarity: "rogue", locked: false, image: "/cards/predaplant.jpg", duelist: "Chuong" },
  { name: "Radiant Typhoon", level: 9, rarity: "meta", locked: false, image: "/cards/radiantTyphoon.jpg", duelist: "Chuong" },
  { name: "Regenesis", level: 7, rarity: "rogue", locked: false, image: "/cards/regenesis.jpg", duelist: "Chuong" },
  { name: "Rose Dragon", level: 7, rarity: "rogue", locked: false, image: "/cards/roseDragon.jpg", duelist: "Chuong" },
  { name: "Shining Sarcophagus", level: 7, rarity: "rogue", locked: false, image: "/cards/shiningSarcophagus.jpg", duelist: "Chuong" },
  { name: "Skull Servant", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/skullServant.jpg", duelist: "Chuong" },
  { name: "Spright", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/spright.jpeg", duelist: "Chuong" },
  { name: "Springans", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/springans.jpg", duelist: "Chuong" },
  { name: "Spyral", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/spyral.jpg", duelist: "Chuong" },
  { name: "Tistina", level: 7, rarity: "rogue", locked: false, image: "/cards/tistina.jpg", duelist: "Chuong" },
  { name: "Train", level: 7, rarity: "rogue", locked: false, image: "/cards/train.jpg", duelist: "Chuong" },
  { name: "Tri-Brigade", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/tri-brigade.jpg", duelist: "Chuong" },
  { name: "Weather Painter", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/weatherPainter.jpg", duelist: "Chuong" },
  { name: "Witchcrafter", level: 8, rarity: "rogue", locked: false, image: "/cards/witchcrafter.jpg", duelist: "Chuong" },
  { name: "Magical Musketeer", level: 7, rarity: "rogue", locked: false, image: "/cards/magicalMusketeer.jpg", duelist: "Chuong" },
  { name: "Neos", level: 7, rarity: "rogue", locked: false, image: "/cards/neos.jpg", duelist: "Chuong" },
  { name: "Toon", level: 8, rarity: "rogue", locked: false, image: "/cards/toon.jpg", duelist: "Chuong" },
  { name: "Ritual of Light and Darkness", level: 8, rarity: "rogue", locked: false, image: "/cards/ritualOfLightAndDarkness.jpg", duelist: "Chuong" },

  // Du
  { name: "Yummy", level: 8, rarity: "meta", locked: false, image: "/cards/yummy-2.jpg", duelist: "Du" },
  { name: "Lunalight", level: 8, rarity: "rogue", locked: false, image: "/cards/lunalight-1.jpg", duelist: "Du" },

  // Duong
  { name: "Dark World", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/darkWorld.jpg", duelist: "Duong" },
  { name: "Red-eyes", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/redEyes-1.jpg", duelist: "Duong" },
  { name: "Shining Sarcophagus", level: 7, rarity: "rogue", locked: false, image: "/cards/shiningSarcophagus.jpg", duelist: "Duong" },
  { name: "Gimmick Puppet", level: 7, rarity: "rogue", locked: false, image: "/cards/gimmickPuppet.jpg", duelist: "Duong" },
  { name: "Millennium", level: 7, rarity: "rogue", locked: false, image: "/cards/millennium.jpeg", duelist: "Duong" },

  // Duy
  { name: "Crystron K9", level: 9, rarity: "meta", locked: false, image: "/cards/crystron-1.jpg", duelist: "Duy" },
  { name: "Vanquish Soul K9", level: 9, rarity: "meta", locked: false, image: "/cards/vanquishSoul.jpg", duelist: "Duy" },
  { name: "Dracotail", level: 9, rarity: "meta", locked: false, image: "/cards/dracotail.jpg", duelist: "Duy" },
  { name: "Junk", level: 8, rarity: "rogue", locked: false, image: "/cards/junk.jpg", duelist: "Duy" },
  { name: "Invoked", level: 8, rarity: "rogue", locked: false, image: "/cards/invoked.jpg", duelist: "Duy" },

  // Fake
  { name: "Dracotail", level: 9, rarity: "meta", locked: false, image: "/cards/dracotailBranded.jpg", duelist: "Fake" },
  { name: "D/D/D", level: 8, rarity: "meta", locked: false, image: "/cards/ddd.jpg", duelist: "Fake" },
  { name: "Atlantean", level: 7, rarity: "rogue", locked: false, image: "/cards/atlantean.jpg", duelist: "Fake" },
  { name: "Branded", level: 9, rarity: "meta", locked: false, image: "/cards/branded.jpg", duelist: "Fake" },
  { name: "Purrely", level: 7, rarity: "rogue", locked: false, image: "/cards/purrely.jpg", duelist: "Fake" },
  { name: "Swordsoul", level: 7, rarity: "rogue", locked: false, image: "/cards/swordsoul.jpg", duelist: "Fake" },
  { name: "Battlewasp", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/battlewasp.jpg", duelist: "Fake" },
  { name: "Shaddoll", level: 7, rarity: "semi-competitive", locked: false, image: "/cards/shaddoll.jpg", duelist: "Fake" },
  { name: "Ogdoabyss", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/ogdoabyss.jpg", duelist: "Fake" },
  { name: "Eldlich", level: 7, rarity: "rogue", locked: false, image: "/cards/eldlich.jpg", duelist: "Fake" },
  { name: "Argostars", level: 7, rarity: "rogue", locked: false, image: "/cards/argostars.jpg", duelist: "Fake" },

  // Phuc
  { name: "P.U.N.K", level: 7, rarity: "rogue", locked: false, image: "/cards/p.u.n.k.jpg", duelist: "Phuc" },
  { name: "Salamangreat", level: 7, rarity: "rogue", locked: false, image: "/cards/salamangreat.jpg", duelist: "Phuc" },
  { name: "Atlantean", level: 7, rarity: "rogue", locked: false, image: "/cards/atlantean.jpg", duelist: "Phuc" },
  { name: "Ancient Gear", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/ancientGear.jpg", duelist: "Phuc" },
  { name: "Burning Abyss", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/burningAbyss.jpg", duelist: "Phuc" },
  { name: "Infernoid", level: 7, rarity: "rogue", locked: false, image: "/cards/infernoid.jpg", duelist: "Phuc" },
  { name: "Exosister", level: 7, rarity: "rogue", locked: false, image: "/cards/exosisters.jpg", duelist: "Phuc" },
  { name: "Phantom Knight", level: 8, rarity: "semi-competitive", locked: false, image: "/cards/phantomKnight.jpg", duelist: "Phuc" },
  { name: "Altergeist", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/altergeist.png", duelist: "Phuc" },
  { name: "Fire King", level: 8, rarity: "rogue", locked: false, image: "/cards/fireKing.jpg", duelist: "Phuc" },

  // Tai
  { name: "Lunalight", level: 8, rarity: "rogue", locked: false, image: "/cards/lunalight-2.jpg", duelist: "Tai" },
  { name: "Yummy", level: 8, rarity: "rogue", locked: false, image: "/cards/yummy-3.jpg", duelist: "Tai" },
  { name: "Super Quantal", level: 7, rarity: "rogue", locked: false, image: "/cards/superQuantal.jpg", duelist: "Tai" },

  // Tam
  { name: "X-saber", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/x-saber.jpg", duelist: "Tam" },
  { name: "HERO", level: 8, rarity: "rogue", locked: false, image: "/cards/hero.jpg", duelist: "Tam" },
  { name: "Enneacraft", level: 8, rarity: "rogue", locked: false, image: "/cards/enneacraft.jpg", duelist: "Tam" },
  { name: "Shark", level: 7, rarity: "rogue", locked: false, image: "/cards/shark.jpg", duelist: "Tam" },
  { name: "Onomatopoeia", level: 7, rarity: "rogue", locked: false, image: "/cards/onomatopoeia.jpg", duelist: "Tam" },
  { name: "Mitsurugi", level: 10, rarity: "meta", locked: false, image: "/cards/mitsurugi.jpg", duelist: "Tam" },
  { name: "Megalith", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/megalith-1.jpg", duelist: "Tam" },
  { name: "Doom-z", level: 8, rarity: "rogue", locked: false, image: "/cards/doomz.jpg", duelist: "Tam" },
  { name: "Dark Lord", level: 8, rarity: "rogue", locked: false, image: "/cards/darklord.jpg", duelist: "Tam" },
  { name: "Blue-eyes", level: 8, rarity: "rogue", locked: false, image: "/cards/blueEyes.jpg", duelist: "Tam" },
  { name: "Raidraptor", level: 7, rarity: "rogue", locked: false, image: "/cards/raidraptor.jpg", duelist: "Tam" },
  { name: "Gem-knight", level: 7, rarity: "rogue", locked: false, image: "/cards/gemKnight.jpg", duelist: "Tam" },

  // Thach
  { name: "Rikka", level: 7, rarity: "rogue", locked: false, image: "/cards/rikka.jpg", duelist: "Thach" },
  { name: "Rose Dragon", level: 7, rarity: "rogue", locked: false, image: "/cards/roseDragon.jpg", duelist: "Thach" },
  { name: "R.B.", level: 7, rarity: "rogue", locked: false, image: "/cards/R.B..jpg", duelist: "Thach" },

  // Thanh
  { name: "Elfnote", level: 10, rarity: "meta", locked: false, image: "/cards/elfnote.jpg", duelist: "Thanh" },
  { name: "Six Samurai", level: 7, rarity: "rogue", locked: false, image: "/cards/sixSamurai.jpg", duelist: "Thanh" },
  { name: "Dark World", level: 6, rarity: "semi-competitive", locked: false, image: "/cards/darkWorld.jpg", duelist: "Thanh" },
  { name: "Rokket", level: 8, rarity: "rogue", locked: false, image: "/cards/rokket.jpg", duelist: "Thanh" },
  { name: "Dragunity", level: 7, rarity: "rogue", locked: false, image: "/cards/dragunity.jpg", duelist: "Thanh" },
  { name: "Dragonmaid", level: 7, rarity: "semi-competitive", locked: false, image: "/cards/dragonmaid.jpg", duelist: "Thanh" },
  { name: "Vanquish Soul", level: 9, rarity: "meta", locked: false, image: "/cards/vanquishSoul.jpg", duelist:"Thanh" },
  { name:"Speedroid" , level :6 , rarity:"semi-competitive" , locked:false , image:"/cards/speedroid.jpg" , duelist:"Thanh"},
  { name: "Red Dragon Archfiend", level: 7, rarity: "rogue", locked: false, image: "/cards/redDragonArchfiend.jpg", duelist: "Thanh" },
  { name: "Dark Lord", level: 8, rarity: "rogue", locked: false, image: "/cards/darklord.jpg", duelist: "Thanh" },
  { name: "Tellarknight", level: 9, rarity: "meta", locked: false, image: "/cards/tellarknight.jpg", duelist: "Thanh" },
  { name: "White Forest", level: 8, rarity: "rogue", locked: false, image: "/cards/whiteForest.jpg", duelist: "Thanh" },
  { name: "Floowandereeze", level: 8, rarity: "rogue", locked: false, image: "/cards/floowandereeze.jpg", duelist: "Thanh" },
  { name: "Swordsoul", level: 7, rarity: "rogue", locked: false, image: "/cards/swordsoul.jpg", duelist: "Thanh" },
  { name: "Raidraptor", level: 7, rarity: "rogue", locked: false, image: "/cards/raidraptor.jpg", duelist:"Thanh" },
  { name:"Apophis" , level :8 , rarity:"rogue" , locked:false , image:"/cards/apophis.jpg" , duelist:"Thanh"},
  { name:"Doom Z" , level :8 , rarity:"rogue" , locked:false , image:"/cards/doomz.jpg" , duelist:"Thanh"},
  { name:"Orcust" , level :8 , rarity:"rogue" , locked:false , image:"/cards/orcust.jpg" , duelist:"Thanh"},
  { name:"True Draco" , level :7 , rarity:"rogue" , locked:false , image:"/cards/trueDraco.png" , duelist:"Thanh"},
  { name: "Fairy Tail", level: 9, rarity: "meta", locked: false, image: "/cards/fairyTail-1.jpg", duelist: "Thanh" },
  { name: "Blue-eyes", level: 8, rarity: "rogue", locked: false, image: "/cards/blueEyes.jpg", duelist: "Thanh" },
  { name: "Predaplant", level: 7, rarity: "rogue", locked: false, image: "/cards/predaplant.jpg", duelist: "Thanh" },
  { name: "Ryzeal", level: 7, rarity: "rogue", locked: false, image: "/cards/ryzeal.jpg", duelist: "Thanh" },

  // Toan
  { name: "Plunder Patrol", level: 7, rarity: "rogue", locked: false, image: "/cards/plunderPatrol.jpg", duelist: "Toan" },
  { name: "Magnet Warrior", level: 9, rarity: "meta", locked: false, image: "/cards/magnetWarrior.jpg", duelist: "Toan" },
  { name: "Crystal Beast", level: 7, rarity: "rogue", locked: false, image: "/cards/crystalBeast.jpg", duelist: "Toan" },
  { name: "Gladiator Beast", level: 7, rarity: "rogue", locked: false, image: "/cards/gladiatorBeast.jpg", duelist: "Toan" },
  { name: "Paleozoic", level: 7, rarity: "rogue", locked: false, image: "/cards/paleozoic.jpg", duelist: "Toan" },
  { name: "Volcanic", level: 4, rarity: "casual", locked: false, image: "/cards/volcanic.jpg", duelist: "Toan" },
  { name: "Ursarctic", level: 4, rarity: "casual", locked: false, image: "/cards/ursarctic.jpg", duelist:"Toan" },
  { name: "Fur Hire", level: 7, rarity: "rogue", locked: false, image: "/cards/furHire.jpg", duelist: "Toan" },

  // Chuong Choice - LOCKED CARDS (IDs 1001+)
  { name:"Amazoness" , level :4 , rarity:"casual" , locked:true , image:"/cards/amazoness.jpg" , duelist:"Chuong Choice"},
  { name:"Simorgh" , level :4 , rarity:"casual" , locked:true , image:"/cards/simorgh.jpg" , duelist:"Chuong Choice"},
  { name: "Gaia", level: 7, rarity: "rogue", locked: true, image: "/cards/gaia.jpg", duelist: "Chuong Choice" },
  { name: "Black Luster Solder", level: 4, rarity: "casual", locked: true, image: "/cards/bls.jpg", duelist: "Chuong Choice" },
  { name: "Krawler", level: 7, rarity: "semi-competitive", locked: true, image: "/cards/krawler.jpg", duelist: "Chuong Choice" },
  { name: "Earthbound", level: 6, rarity: "semi-competitive", locked: true, image: "/cards/earthbound.jpg", duelist: "Chuong Choice" },
  { name: "Clear", level: 6, rarity: "semi-competitive", locked: true, image: "/cards/clear.jpg", duelist: "Chuong Choice" },
  { name: "Yosenju", level: 6, rarity: "semi-competitive", locked: true, image: "/cards/yosenju.jpg", duelist: "Chuong Choice" },
  { name: "Windwitch", level: 6, rarity: "semi-competitive", locked: true, image: "/cards/windwitch.jpg", duelist: "Chuong Choice" },
  { name: "Laval", level: 6, rarity: "semi-competitive", locked: true, image: "/cards/laval.jpg", duelist: "Chuong Choice" },
  { name: "Time Thief", level: 5, rarity: "semi-competitive", locked: true, image: "/cards/timeThief.jpg", duelist: "Chuong Choice" },
  { name: "Nephthys", level: 6, rarity: "semi-competitive", locked: true, image: "/cards/nephthys.jpg", duelist: "Chuong Choice" },
  { name: "Hazy Flame", level: 7, rarity: "rogue", locked: true, image: "/cards/hazyFlame.jpg", duelist: "Chuong Choice" },
  { name: "Fortune Lady", level: 5, rarity: "semi-competitive", locked: true, image: "/cards/fortuneLady.jpg", duelist: "Chuong Choice" },
  { name: "Shinobird", level: 7, rarity: "rogue", locked: true, image: "/cards/shinobird.jpg", duelist: "Chuong Choice" },
  { name: "Penguin", level: 6, rarity: "semi-competitive", locked: true, image: "/cards/penguin.jpg", duelist: "Chuong Choice" },
  { name: "Psy-frame", level: 6, rarity: "semi-competitive", locked: true, image: "/cards/psy-frame.jpg", duelist: "Chuong Choice" },
  { name: "Joker Knight", level: 5, rarity: "semi-competitive", locked: true, image: "/cards/jokerKnight.jpg", duelist: "Chuong Choice" },
  { name: "Performage", level: 6, rarity: "semi-competitive", locked: true, image: "/cards/performage.jpg", duelist: "Chuong Choice" },
  { name: "Sacred Beast", level: 6, rarity: "semi-competitive", locked: true, image: "/cards/sacredBeast.jpg", duelist: "Chuong Choice" },
  { name: "Star Warrior", level: 6, rarity: "semi-competitive", locked: true, image: "/cards/starWarrior.jpg", duelist: "Chuong Choice" },
  { name: "U.A", level: 6, rarity: "semi-competitive", locked: true, image: "/cards/u-a.jpg", duelist: "Chuong Choice" },
  { name: "F.A", level: 8, rarity: "rogue", locked: true, image: "/cards/f-a.jpg", duelist: "Chuong Choice" },
  { name: "Batteryman", level: 7, rarity: "rogue", locked: true, image: "/cards/batteryman.jpg", duelist: "Chuong Choice" },
  { name: "Prediction Princess", level: 6, rarity: "semi-competitive", locked: true, image: "/cards/predictionPrincess.jpg", duelist: "Chuong Choice" },
  { name: "Noble Knight", level: 7, rarity: "rogue", locked: true, image: "/cards/nobleKnight.jpg", duelist: "Chuong Choice" },
  { name: "Battlin Boxer", level: 7, rarity: "rogue", locked: true, image: "/cards/battlinBoxer.jpg", duelist: "Chuong Choice" },
  { name: "Heroic", level: 7, rarity: "rogue", locked: true, image: "/cards/heroic.jpg", duelist: "Chuong Choice" },
  { name: "Watt", level: 6, rarity: "semi-competitive", locked: true, image: "/cards/watt.jpg", duelist: "Chuong Choice" },
  { name: "Vampire", level: 7, rarity: "rogue", locked: true, image: "/cards/vampire.jpg", duelist: "Chuong Choice" },
  { name: "Aqua Actress", level: 7, rarity: "rogue", locked: true, image: "/cards/aquaActress.jpg", duelist: "Chuong Choice" },
  { name: "Jinzo", level: 8, rarity: "rogue", locked: true, image: "/cards/jinzo.jpg", duelist: "Chuong Choice" },
  { name: "Amorphage", level: 7, rarity: "rogue", locked: true, image: "/cards/amorphage.jpg", duelist: "Chuong Choice" },
  { name: "Graydle", level: 9, rarity: "meta", locked: true, image: "/cards/graydle.jpg", duelist: "Chuong Choice" },
  { name: "Relinquished", level: 7, rarity: "rogue", locked: true, image: "/cards/relinquished.jpg", duelist: "Chuong Choice" },
  { name: "Mecha Phantom Beast", level: 7, rarity: "rogue", locked: true, image: "/cards/mechaPhantomBeast.jpg", duelist: "Chuong Choice" },
  { name: "Vendread", level: 7, rarity: "rogue", locked: true, image: "/cards/vendread.jpg", duelist: "Chuong Choice" },
  { name: "Triamid", level: 6, rarity: "semi-competitive", locked: true, image: "/cards/triamid.jpg", duelist: "Chuong Choice" },
  { name: "Igknight", level: 6, rarity: "semi-competitive", locked: true, image: "/cards/igknight.jpg", duelist: "Chuong Choice" },
  { name: "Allure Queen", level: 6, rarity: "semi-competitive", locked: true, image: "/cards/allureQueen.jpg", duelist: "Chuong Choice" },
  { name: "Shiranui", level: 6, rarity: "semi-competitive", locked: true, image: "/cards/shiranui.jpg", duelist: "Chuong Choice" },
  { name: "Metaphys", level: 7, rarity: "rogue", locked: true, image: "/cards/metaphys.jpg", duelist: "Chuong Choice" },
  { name: "Zombie World", level: 7, rarity: "rogue", locked: true, image: "/cards/zombieWorld.jpg", duelist: "Chuong Choice" },
];

export const cardsData: Card[] = rawCards.map((card, index) => ({
  id: index + 1,
  ...card,
}));
