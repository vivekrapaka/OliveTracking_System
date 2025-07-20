import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import apiClient from '@/services/apiClient';
import karyaLogo from "@/assets/karya_logo.png";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setIsTokenValid(false);
      toast({
        title: "Invalid Reset Link",
        description: "The password reset link is invalid or missing the required token.",
        variant: "destructive"
      });
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  // Password validation function
  const validatePassword = (password: string) => {
    const minLength = password.length >= 6;
    const hasCapital = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return {
      isValid: minLength && hasCapital && hasNumber,
      errors: {
        minLength,
        hasCapital,
        hasNumber
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast({
        title: "Error",
        description: "Invalid reset token",
        variant: "destructive"
      });
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      let errorMessage = "Password must contain:";
      if (!passwordValidation.errors.minLength) errorMessage += "\n• At least 6 characters";
      if (!passwordValidation.errors.hasCapital) errorMessage += "\n• At least one capital letter";
      if (!passwordValidation.errors.hasNumber) errorMessage += "\n• At least one number";
      
      toast({
        title: "Password Requirements",
        description: errorMessage,
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token: token,
        newPassword: newPassword
      });
      
      console.log('Reset password response:', response.data);
      setIsSuccess(true);
      
      toast({
        title: "Success",
        description: response.data.message || "Password has been reset successfully."
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      if (error.response?.status === 400) {
        toast({
          title: "Invalid or Expired Token",
          description: "The password reset link is invalid or has expired. Please request a new one.",
          variant: "destructive"
        });
        setIsTokenValid(false);
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to reset password. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isTokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img 
              src={karyaLogo}
              alt="KARYA" 
              className="h-16 w-auto mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-slate-900 mb-2">K A R Y A</h1>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-700">Invalid Reset Link</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-slate-600">
                The password reset link is invalid or has expired.
              </p>
              <p className="text-sm text-slate-500">
                Please request a new password reset link from the login page.
              </p>
              <div className="pt-4">
                <Link to="/login">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img 
              src={karyaLogo}
              alt="KARYA" 
              className="h-16 w-auto mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-slate-900 mb-2">K A R Y A</h1>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-700">Password Reset Successfully</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-slate-600">
                Your password has been reset successfully!
              </p>
              <p className="text-sm text-slate-500">
                You will be redirected to the login page in a few seconds.
              </p>
              <div className="pt-4">
                <Link to="/login">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src={karyaLogo}
            alt="KARYA" 
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">K A R Y A</h1>
          <p className="text-slate-600">Reset your password</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Reset Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-600">
                  Password must be at least 6 characters long and contain at least one capital letter and one number.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
              
              <div className="text-center">
                <Link to="/login" className="text-blue-600 hover:text-blue-700 text-sm">
                  <ArrowLeft className="h-4 w-4 inline mr-1" />
                  Back to Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword; 