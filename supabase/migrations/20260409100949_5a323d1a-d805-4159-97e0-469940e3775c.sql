
-- Create roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'staff',
    approved BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Security definer to check if user is approved
CREATE OR REPLACE FUNCTION public.is_approved(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND approved = true
  )
$$;

-- Get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS policies: only admins can manage roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Profiles table for display info
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT NOT NULL,
    display_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INT;
  assigned_role app_role;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  
  IF user_count = 0 THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := 'staff';
  END IF;

  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));

  INSERT INTO public.user_roles (user_id, role, approved)
  VALUES (NEW.id, assigned_role, true);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create data tables for the app
CREATE TABLE public.consignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TEXT,
    consignment_no TEXT NOT NULL,
    marka TEXT,
    total_ctns INTEGER DEFAULT 0,
    cbm NUMERIC DEFAULT 0,
    gw NUMERIC DEFAULT 0,
    destination TEXT,
    status TEXT DEFAULT '',
    client TEXT,
    remarks TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.consignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view consignments"
ON public.consignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert consignments"
ON public.consignments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update consignments"
ON public.consignments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete consignments"
ON public.consignments FOR DELETE TO authenticated USING (true);

CREATE TABLE public.loading_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TEXT,
    consignment_no TEXT NOT NULL,
    marka TEXT,
    total_ctns INTEGER DEFAULT 0,
    cbm NUMERIC DEFAULT 0,
    gw NUMERIC DEFAULT 0,
    destination TEXT,
    lot_no TEXT,
    dispatched_from TEXT,
    container TEXT,
    status TEXT DEFAULT '',
    arrival_date_nylam TEXT,
    kerung JSONB DEFAULT '{}',
    tatopani JSONB DEFAULT '{}',
    client TEXT,
    remarks TEXT,
    follow_up BOOLEAN DEFAULT false,
    origin TEXT CHECK (origin IN ('guangzhou', 'yiwu')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.loading_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view loading_list"
ON public.loading_list FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert loading_list"
ON public.loading_list FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update loading_list"
ON public.loading_list FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete loading_list"
ON public.loading_list FOR DELETE TO authenticated USING (true);

CREATE TABLE public.old_nylam_goods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TEXT,
    consignment_no TEXT,
    marka TEXT,
    total_ctn INTEGER DEFAULT 0,
    ctn_remaining_nylam INTEGER DEFAULT 0,
    loaded_ctn INTEGER DEFAULT 0,
    cbm NUMERIC DEFAULT 0,
    gw NUMERIC DEFAULT 0,
    destination TEXT,
    dispatched_from_nylam TEXT,
    nylam_container TEXT,
    arrival_location TEXT,
    arrival_date TEXT,
    client TEXT,
    follow_up BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.old_nylam_goods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view old_nylam_goods"
ON public.old_nylam_goods FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert old_nylam_goods"
ON public.old_nylam_goods FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update old_nylam_goods"
ON public.old_nylam_goods FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete old_nylam_goods"
ON public.old_nylam_goods FOR DELETE TO authenticated USING (true);

CREATE TABLE public.containers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    container_no TEXT NOT NULL,
    total_consignments INTEGER DEFAULT 0,
    dispatched_date TEXT,
    dispatched_from TEXT,
    arrival_date TEXT,
    arrival_location TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.containers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view containers"
ON public.containers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert containers"
ON public.containers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update containers"
ON public.containers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete containers"
ON public.containers FOR DELETE TO authenticated USING (true);

CREATE TABLE public.remaining_ctns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consignment_date TEXT,
    consignment_no TEXT,
    marka TEXT,
    total_ctn INTEGER DEFAULT 0,
    cbm NUMERIC DEFAULT 0,
    gw NUMERIC DEFAULT 0,
    destination TEXT,
    remaining_ctn INTEGER DEFAULT 0,
    remaining_ctn_location TEXT,
    client TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.remaining_ctns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view remaining_ctns"
ON public.remaining_ctns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert remaining_ctns"
ON public.remaining_ctns FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update remaining_ctns"
ON public.remaining_ctns FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete remaining_ctns"
ON public.remaining_ctns FOR DELETE TO authenticated USING (true);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_consignments_updated_at BEFORE UPDATE ON public.consignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_loading_list_updated_at BEFORE UPDATE ON public.loading_list FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_old_nylam_goods_updated_at BEFORE UPDATE ON public.old_nylam_goods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_containers_updated_at BEFORE UPDATE ON public.containers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_remaining_ctns_updated_at BEFORE UPDATE ON public.remaining_ctns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
