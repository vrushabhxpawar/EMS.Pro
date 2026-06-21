import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Shield, ShieldOff } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email) e.email = "Email is required";
    if (form.password.length < 8) e.password = "Min 8 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      console.log(res);
      navigate("/login");
    } catch (err) {
      setErrors({
        server: err.response?.data?.message || "Registration failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, type = "text") => {
    const isPasswordField = key === "password" || key === "confirm";

    const showPasswordField =
      key === "password" ? showPassword : showConfirmPassword;

    return (
      <div>
        <Label htmlFor={key}>{label}</Label>

        <div className="relative mt-1">
          <Input
            id={key}
            type={
              isPasswordField ? (showPasswordField ? "text" : "password") : type
            }
            value={form[key]}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                [key]: e.target.value,
              }))
            }
            className={`pr-10 ${errors[key] ? "border-red-400" : ""}`}
          />

          {isPasswordField && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              onClick={() => {
                if (key === "password") {
                  setShowPassword((prev) => !prev);
                } else {
                  setShowConfirmPassword((prev) => !prev);
                }
              }}
            >
              {showPasswordField ? (
                <ShieldOff className="h-4 w-4" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {errors[key] && (
          <p className="text-xs text-red-500 mt-1">{errors[key]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-xl font-semibold mb-1">Create account</h1>
        <p className="text-sm text-gray-500 mb-6">Join your team on TaskFlow</p>

        {errors.server && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {errors.server}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {field("name", "Full name")}
          {field("email", "Email", "email")}
          {field("password", "Password", "password")}
          {field("confirm", "Confirm password", "password")}
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-black font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
