CREATE TABLE public.cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  card_type text NOT NULL DEFAULT 'feitico',
  subtype text,
  title text,
  title_align text NOT NULL DEFAULT 'left',
  flavor_text text,
  effect_text text,
  cost_icon integer NOT NULL DEFAULT 0,
  cost_number text,
  card_number text,
  rarity text NOT NULL DEFAULT 'none',
  base_color text NOT NULL DEFAULT '#9ec6e0',
  border_color text NOT NULL DEFAULT '#7aaac8',
  auto_border boolean NOT NULL DEFAULT true,
  border_style text NOT NULL DEFAULT 'simple',
  texture1 text NOT NULL DEFAULT 'fabric',
  texture1_int integer NOT NULL DEFAULT 30,
  texture2 text NOT NULL DEFAULT 'vignette',
  texture2_int integer NOT NULL DEFAULT 40,
  title_font text NOT NULL DEFAULT 'Cinzel',
  body_font text NOT NULL DEFAULT 'EB Garamond',
  title_size integer NOT NULL DEFAULT 52,
  art_fit text NOT NULL DEFAULT 'cover',
  art_x integer NOT NULL DEFAULT 50,
  art_y integer NOT NULL DEFAULT 50,
  art_zoom integer NOT NULL DEFAULT 100,
  art_url text,
  thumbnail_url text,
  back_url text,
  neon_inner boolean NOT NULL DEFAULT false,
  auto_text boolean NOT NULL DEFAULT true,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cards TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cards TO authenticated;
GRANT ALL ON public.cards TO service_role;

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read cards" ON public.cards FOR SELECT USING (true);
CREATE POLICY "Public insert cards" ON public.cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update cards" ON public.cards FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete cards" ON public.cards FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER cards_set_updated_at BEFORE UPDATE ON public.cards
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();