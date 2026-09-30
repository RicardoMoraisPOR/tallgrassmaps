import { createContext, type ReactNode, useContext } from 'react';

const StoryGameContext = createContext('red');

export const StoryGameProvider = ({
  gameId,
  children,
}: {
  gameId: string;
  children: ReactNode;
}) => (
  <StoryGameContext.Provider value={gameId}>
    {children}
  </StoryGameContext.Provider>
);

export const useStoryGameId = () => useContext(StoryGameContext);
