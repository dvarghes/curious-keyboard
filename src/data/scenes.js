export const SCENES = [
  { id: 'meadow', name: 'Sunny Meadow', mood: 'Soft hills and slow clouds' },
  { id: 'space', name: 'Star Lane', mood: 'Gentle stars, no flicker' },
  { id: 'ocean', name: 'Coral Bay', mood: 'Slow water and fish at the sides' },
  { id: 'forest', name: 'Lantern Woods', mood: 'Fireflies in a dusk wood' },
  { id: 'castle', name: 'Cloud Castle', mood: 'Banners and still towers' },
  { id: 'lab', name: 'Gadget Lab', mood: 'A soft science grid' },
];

export function sceneById(id) {
  return SCENES.find((item) => item.id === id) || SCENES[0];
}
