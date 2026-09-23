export const AVATARS = [
  { id: 'fox', name: 'Flicker the Fox', note: 'Orange scarf, friendly' },
  { id: 'panda', name: 'Pip Panda', note: 'Round and high contrast' },
  { id: 'owl', name: 'Nia Owl', note: 'Glasses for watching the screen' },
  { id: 'robot', name: 'Dot the Robot', note: 'LED smile' },
  { id: 'dragon', name: 'Ember Dragon', note: 'Small and calm' },
  { id: 'cat', name: 'Key Cat', note: 'Paws ready on the home row' },
  { id: 'astronaut', name: 'Nova', note: 'Helmet up so you can see a face' },
  { id: 'dino', name: 'Type-o-saur', note: 'Tiny arms, two hands on the keys' },
];

export function avatarById(id) {
  return AVATARS.find((item) => item.id === id) || AVATARS[0];
}
