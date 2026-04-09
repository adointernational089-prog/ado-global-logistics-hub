import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Loader2 } from 'lucide-react';

const Login = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [checkingFirst, setCheckingFirst] = useState(true);

  useEffect(() => {
    const checkFirstUser = async () => {
      const { count } = await supabase.from('user_roles').select('*', { count: 'exact', head: true });
      setIsFirstUser(count === 0);
      setCheckingFirst(false);
    };
    checkFirstUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isFirstUser) {
      // Sign up the first admin
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: email } },
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      // Auto sign-in after signup
      const { error: loginError } = await signIn(email, password);
      if (loginError) setError(loginError);
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    }
    setLoading(false);
  };

  if (checkingFirst) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Truck className="h-8 w-8 text-accent" />
          </div>
          <CardTitle className="text-xl">ADO International Transport</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {isFirstUser ? 'Create your admin account' : 'Sign in to continue'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Email</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your email" />
            </div>
            <div>
              <label className="text-sm font-semibold">Password</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password" />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isFirstUser ? 'Create Admin Account' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
