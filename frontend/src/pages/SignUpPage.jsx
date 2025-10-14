import { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowRight, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";

const SignUpPage = () => {
        const [formData, setFormData] = useState({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
        });

        const { signup, loading } = useUserStore();

        const handleSubmit = (e) => {
                e.preventDefault();
                signup(formData);
        };

        const renderField = (id, label, type, Icon, placeholder, valueKey) => (
                <div>
                        <label htmlFor={id} className='block text-sm font-medium text-white/80'>
                                {label}
                        </label>
                        <div className='relative mt-1 rounded-md shadow-sm'>
                                <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                                        <Icon className='h-5 w-5 text-white/50' aria-hidden='true' />
                                </div>
                                <input
                                        id={id}
                                        type={type}
                                        required
                                        value={formData[valueKey]}
                                        onChange={(e) => setFormData({ ...formData, [valueKey]: e.target.value })}
                                        className='block w-full rounded-md border border-payzone-indigo/40 bg-payzone-navy/60 px-3 py-2 pl-10 text-white placeholder-white/40 focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo sm:text-sm'
                                        placeholder={placeholder}
                                />
                        </div>
                </div>
        );

        return (
                <div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
                        <motion.div
                                className='sm:mx-auto sm:w-full sm:max-w-md'
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                        >
                                <h2 className='mt-6 text-center text-3xl font-extrabold text-payzone-gold'>Create your Payzone account</h2>
                        </motion.div>

                        <motion.div
                                className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                        >
                                <div className='rounded-xl border border-payzone-indigo/40 bg-white/5 py-8 px-4 shadow backdrop-blur-sm sm:px-10'>
                                        <form onSubmit={handleSubmit} className='space-y-6'>
                                                {renderField("name", "Full name", "text", User, "John Doe", "name")}
                                                {renderField("email", "Email address", "email", Mail, "you@example.com", "email")}
                                                {renderField("password", "Password", "password", Lock, "••••••••", "password")}
                                                {renderField("confirmPassword", "Confirm Password", "password", Lock, "••••••••", "confirmPassword")}

                                                <button
                                                        type='submit'
                                                        className='flex w-full items-center justify-center gap-2 rounded-md bg-payzone-gold px-4 py-2 text-sm font-semibold text-payzone-navy transition duration-300 hover:bg-[#b8873d] focus:outline-none focus:ring-2 focus:ring-payzone-indigo/60 disabled:opacity-50'
                                                        disabled={loading}
                                                >
                                                        {loading ? (
                                                                <>
                                                                        <Loader className='h-5 w-5 animate-spin' aria-hidden='true' />
                                                                        Loading...
                                                                </>
                                                        ) : (
                                                                <>
                                                                        <UserPlus className='h-5 w-5' aria-hidden='true' />
                                                                        Sign up
                                                                </>
                                                        )}
                                                </button>
                                        </form>

                                        <p className='mt-8 text-center text-sm text-white/70'>
                                                Already have an account?{" "}
                                                <Link to='/login' className='font-medium text-payzone-indigo transition duration-300 hover:text-payzone-gold'>
                                                        Login here <ArrowRight className='ml-1 inline h-4 w-4' />
                                                </Link>
                                        </p>
                                </div>
                        </motion.div>
                </div>
        );
};
export default SignUpPage;
