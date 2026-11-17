import React, { useState } from 'react';
import { Panel } from '../components/Panel';
import { Tabs } from '../components/Tabs';

export const StoryScreen: React.FC = () => {
  const [selectedChapter, setSelectedChapter] = useState('1');

  const chapters = Array.from({ length: 10 }).map((_, i) => ({
    id: String(i + 1),
    label: `Chapter ${i + 1}`,
  }));

  const chapterLore: Record<string, { title: string; dialogue: string }> = {
    '1': {
      title: 'An Heir Arrives in Greenvale',
      dialogue: '“The ancestral lands of your forebears lie before you. Weeds choke the ditches, yet the river still flows and the soil is ripe for sowing. Take the spade in hand, and begin.”',
    },
    '2': {
      title: 'Smoke on the Horizon',
      dialogue: '“Peasants from neighboring fiefs gather at your palisade. They speak of famine to the east, but here in your settlement, bread begins to bake and laughter returns to the hearth.”',
    },
    '3': {
      title: 'The Sound of the Hammer',
      dialogue: '“Masons from Stonehaven and millers from Riverford bring their craft. The sound of clattering waterwheels and glowing smithy embers marks your realm as a true trade town.”',
    },
    '4': {
      title: 'Echoes in the Deep',
      dialogue: '“Under the granite crags of Ironridge, prospectors strike deep veins of rich copper and sparkling coal. Smoke billows from the furnaces as the first iron ingots are drawn.”',
    },
    '5': {
      title: 'The Charter of the Sovereign',
      dialogue: '“A herald arrives bearing parchment affixed with royal wax. Your holding is no longer a mere outpost; the crown has granted you sovereign township charters.”',
    },
    '6': {
      title: 'Nobility in Silk and Steel',
      dialogue: '“Lady Isolde and the high aristocracy ride into the court. They bring immense fortunes and sprawling estates, demanding vintage wines and grand palaces.”',
    },
    '7': {
      title: 'The Spires of Knowledge',
      dialogue: '“Scholars from across the sea dock at your grand ports. The foundations of the University of Eldoria are laid, illuminating the continent with philosophy and law.”',
    },
    '8': {
      title: 'The Sovereign Castle',
      dialogue: '“A high stone fortress crowns the highest peak. The royal mint strikes coins bearing your dynastic sigil; your decree carries the force of sovereign lordship.”',
    },
    '9': {
      title: 'The Imperial Fleet',
      dialogue: '“Five fleets sail under your banners, linking continents from Frostmere to Sunreach. Monarchs abroad address you as equal, seeking your counsel.”',
    },
    '10': {
      title: 'The Emperor of Eldoria',
      dialogue: '“The three fragments of the Relic Crown are reunited. Before lords, commoners, and cardinals, you are crowned Emperor of Eldoria. An eternal dynasty is forged.”',
    },
  };

  const currentLore = chapterLore[selectedChapter] || chapterLore['1'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <Panel title="Chronicles of Eldoria" subtitle="The history, dialogue, and lore of your ascent">
        <Tabs tabs={chapters} activeTab={selectedChapter} onChange={setSelectedChapter} />

        <div style={{ marginTop: '20px', padding: '24px', background: 'var(--color-bg-elevated)', borderRadius: '8px', borderLeft: '4px solid var(--color-gold)' }}>
          <h3 style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>{currentLore.title}</h3>
          <p style={{ fontStyle: 'italic', fontSize: '16px', lineHeight: 1.8, color: 'var(--color-text-main)' }}>
            {currentLore.dialogue}
          </p>
        </div>
      </Panel>
    </div>
  );
};
