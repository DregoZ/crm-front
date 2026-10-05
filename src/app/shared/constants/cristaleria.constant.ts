import { SelectOption } from '../models/form-fields.model';

export const CRISTALERIA_OPTIONS: SelectOption[] = [
  { value: 'Vaso Collins / Highball', label: 'Vaso Collins / Highball (Trago largo)' },
  { value: 'Vaso Old Fashioned (Lowball)', label: 'Vaso Old Fashioned / On the Rocks (Corto)' },
  { value: 'Copa Coupé / Margarita', label: 'Copa Coupé / Margarita' },
  { value: 'Copa Martini / Cocktail', label: 'Copa Martini / Cocktail' },
  { value: 'Copa Balón / Vino Grande', label: 'Copa Balón (Gin Tonic / Spritz)' },
  { value: 'Copa Flauta', label: 'Copa Flauta (Espumosos / Champagne)' },
  { value: 'Vaso Tubo', label: 'Vaso Tubo clásico' },
  { value: 'Jarra / Mug de Cobre', label: 'Jarra / Mug de Cobre (Moscow Mule)' },
  { value: 'Vaso Chupito / Shot', label: 'Vaso Chupito / Shot' },
  { value: 'Jarra / Mug de Acero', label: 'Jarra / Mug de Acero (Negroni)' },
];

export const UNIDADES_MEDIDA_OPTIONS: SelectOption[] = [
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'pieza', label: 'Pieza(s)' },
  { value: 'gramos', label: 'Gramos (g)' },
  { value: 'hojas', label: 'Hojas' },
];
