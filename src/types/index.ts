// src/types/index.ts

/**
 * Este é o objeto que será guardado no array JSONB da tua base de dados.
 * Representa um alimento ADICIONADO a uma refeição.
 */
export interface DietFoodItem {
    id: string; // Um ID único para este item na refeição (criado com crypto.randomUUID())
    food_id: string; // O ID original do alimento (da tabela 'alimentos' ou da API)
    name: string;
    qty: number; // A quantidade (ex: 150)
    unit: string; // A unidade (ex: "g" ou "unidade")
    
    // Macros base (normalmente por 100g ou por 1 unidade)
    base_kcal: number;
    base_p: number; // Proteína
    base_c: number; // Carboidratos
    base_f: number; // Gordura (Fat)
    
    image_url: string | null;
  }
  
  /**
   * Este é o tipo de dados que vem da tua tabela 'alimentos'.
   * É importante tê-lo para o FoodSearch.
   */
  export type Food = {
    id: string;
    professional_id: string;
    name: string;
    category: string;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    image_url: string | null;
  };
  
  /**
   * Este é o tipo de dados que vem da API Open Food Facts.
   */
  export type OpenFoodFactsProduct = {
    _id: string;
    product_name: string;
    product_name_pt?: string;
    brands?: string;
    image_front_thumb_url?: string;
    image_front_url?: string;
    nutriments: {
      "energy-kcal_100g"?: number;
      proteins_100g?: number;
      carbohydrates_100g?: number;
      fat_100g?: number;
    };
    quantity?: string; // Ex: "100 g"
  };