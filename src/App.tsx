import { GameContainer } from './components/GameContainer';
import memesData from './data/memes.json';
import type { Meme } from './types';

const memes: Meme[] = memesData.memes as Meme[];

function App() {
  return <GameContainer memes={memes} />;
}

export default App;
