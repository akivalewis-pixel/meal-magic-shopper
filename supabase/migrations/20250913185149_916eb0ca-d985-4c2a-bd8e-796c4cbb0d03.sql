-- Create table to snapshot meals in each saved weekly plan
CREATE TABLE IF NOT EXISTS public.weekly_plan_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES public.weekly_meal_plans(id) ON DELETE CASCADE,
  meal_id UUID, -- optional reference to current meals table
  title TEXT NOT NULL,
  day TEXT NOT NULL,
  recipe_url TEXT,
  ingredients TEXT[] DEFAULT '{}',
  dietary_preferences TEXT[] DEFAULT '{}',
  notes TEXT,
  rating INTEGER CHECK (rating BETWEEN 0 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.weekly_plan_meals ENABLE ROW LEVEL SECURITY;

-- Policies: users can manage only their own plan meals
CREATE POLICY "Select own plan meals"
ON public.weekly_plan_meals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Insert own plan meals"
ON public.weekly_plan_meals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own plan meals"
ON public.weekly_plan_meals
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Delete own plan meals"
ON public.weekly_plan_meals
FOR DELETE
USING (auth.uid() = user_id);

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_weekly_plan_meals_plan_id ON public.weekly_plan_meals(plan_id);
CREATE INDEX IF NOT EXISTS idx_weekly_plan_meals_user_id ON public.weekly_plan_meals(user_id);
