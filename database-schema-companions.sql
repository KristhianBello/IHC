-- Schema adicional para sistema de compañeros/amigos
-- Ejecutar después de tener las tablas existentes

-- Tabla para gestionar las relaciones de amistad/compañeros
CREATE TABLE public.user_friendships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  addressee_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_friendships_pkey PRIMARY KEY (id),
  CONSTRAINT user_friendships_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT user_friendships_addressee_id_fkey FOREIGN KEY (addressee_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT user_friendships_unique_pair UNIQUE (requester_id, addressee_id),
  CONSTRAINT user_friendships_no_self_request CHECK (requester_id != addressee_id)
);

-- Tabla para configuración de privacidad de perfiles
CREATE TABLE public.profile_privacy_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  show_profile boolean DEFAULT true,
  show_email boolean DEFAULT false,
  show_phone boolean DEFAULT false,
  show_location boolean DEFAULT true,
  show_interests boolean DEFAULT true,
  show_skills boolean DEFAULT true,
  allow_friend_requests boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profile_privacy_settings_pkey PRIMARY KEY (id),
  CONSTRAINT profile_privacy_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT profile_privacy_settings_user_id_unique UNIQUE (user_id)
);

-- Tabla para notificaciones de amistad
CREATE TABLE public.friendship_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  friendship_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('friend_request', 'friend_accepted', 'friend_rejected')),
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT friendship_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT friendship_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT friendship_notifications_friendship_id_fkey FOREIGN KEY (friendship_id) REFERENCES public.user_friendships(id) ON DELETE CASCADE
);

-- Tabla para posts del foro (si no existe)
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  location text,
  coordinates jsonb,
  author_id uuid NOT NULL,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabla para likes de posts
CREATE TABLE IF NOT EXISTS public.post_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT post_likes_pkey PRIMARY KEY (id),
  CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE,
  CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT post_likes_unique_user_post UNIQUE (user_id, post_id)
);

-- Tabla para comentarios de posts
CREATE TABLE IF NOT EXISTS public.post_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  parent_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT post_comments_pkey PRIMARY KEY (id),
  CONSTRAINT post_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE,
  CONSTRAINT post_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT post_comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.post_comments(id) ON DELETE CASCADE
);

-- Índices para mejorar performance
CREATE INDEX idx_user_friendships_requester ON public.user_friendships(requester_id);
CREATE INDEX idx_user_friendships_addressee ON public.user_friendships(addressee_id);
CREATE INDEX idx_user_friendships_status ON public.user_friendships(status);
CREATE INDEX idx_friendship_notifications_user_unread ON public.friendship_notifications(user_id, is_read);
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX idx_post_comments_post ON public.post_comments(post_id);

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE public.user_friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendship_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Políticas para user_friendships
CREATE POLICY "Users can view their own friendship relationships" ON public.user_friendships
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can create friendship requests" ON public.user_friendships
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their friendship relationships" ON public.user_friendships
  FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Políticas para profile_privacy_settings
CREATE POLICY "Users can view their own privacy settings" ON public.profile_privacy_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own privacy settings" ON public.profile_privacy_settings
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para friendship_notifications
CREATE POLICY "Users can view their own notifications" ON public.friendship_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.friendship_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para posts
CREATE POLICY "Anyone can view posts" ON public.posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON public.posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- Políticas para post_likes
CREATE POLICY "Anyone can view post likes" ON public.post_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage their own likes" ON public.post_likes
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para post_comments
CREATE POLICY "Anyone can view post comments" ON public.post_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.post_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own comments" ON public.post_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.post_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Triggers para actualizar campos updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_friendships_updated_at BEFORE UPDATE ON public.user_friendships FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_profile_privacy_settings_updated_at BEFORE UPDATE ON public.profile_privacy_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_post_comments_updated_at BEFORE UPDATE ON public.post_comments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Función para incrementar contador de likes
CREATE OR REPLACE FUNCTION increment_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts 
  SET likes_count = likes_count + 1 
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para decrementar contador de likes
CREATE OR REPLACE FUNCTION decrement_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts 
  SET likes_count = likes_count - 1 
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Función para incrementar contador de comentarios
CREATE OR REPLACE FUNCTION increment_post_comments()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts 
  SET comments_count = comments_count + 1 
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para decrementar contador de comentarios
CREATE OR REPLACE FUNCTION decrement_post_comments()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts 
  SET comments_count = comments_count - 1 
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers para mantener contadores actualizados
CREATE TRIGGER post_likes_increment AFTER INSERT ON public.post_likes FOR EACH ROW EXECUTE FUNCTION increment_post_likes();
CREATE TRIGGER post_likes_decrement AFTER DELETE ON public.post_likes FOR EACH ROW EXECUTE FUNCTION decrement_post_likes();
CREATE TRIGGER post_comments_increment AFTER INSERT ON public.post_comments FOR EACH ROW EXECUTE FUNCTION increment_post_comments();
CREATE TRIGGER post_comments_decrement AFTER DELETE ON public.post_comments FOR EACH ROW EXECUTE FUNCTION decrement_post_comments();
