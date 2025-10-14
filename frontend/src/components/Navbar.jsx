import { ShoppingCart, UserPlus, LogIn, LogOut, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";

const Navbar = () => {
        const { user, logout } = useUserStore();
        const isAdmin = user?.role === "admin";
        const { cart } = useCartStore();

        return (
                <header className='fixed top-0 left-0 w-full border-b border-payzone-indigo/40 bg-payzone-navy/95 backdrop-blur-xl shadow-lg transition-all duration-300 z-40'>
                        <div className='container mx-auto px-4 py-3'>
                                <div className='flex flex-wrap items-center justify-between gap-4'>
                                        <Link to='/' className='flex items-center gap-3 text-payzone-white'>
                                                <span className='flex h-10 w-10 items-center justify-center rounded-md bg-white/10 ring-1 ring-payzone-indigo/50'>
                                                        <img src='/logo.png' alt='Payzone logo' className='h-6 w-6 object-contain' />
                                                </span>
                                                <span className='text-2xl font-semibold uppercase tracking-wide'>payzone</span>
                                        </Link>

                                        <nav className='flex flex-wrap items-center gap-4 text-sm font-medium'>
                                                <Link
                                                        to={"/"}
                                                        className='text-white/80 transition duration-300 ease-in-out hover:text-payzone-indigo'
                                                >
                                                        Home
                                                </Link>
                                                {user && (
                                                        <Link
                                                                to={"/cart"}
                                                                className='relative group text-white/80 transition duration-300 ease-in-out hover:text-payzone-indigo'
                                                        >
                                                                <ShoppingCart className='inline-block mr-1 transition-colors duration-300 group-hover:text-payzone-indigo' size={20} />
                                                                <span className='hidden sm:inline'>Cart</span>
                                                                {cart.length > 0 && (
                                                                        <span
                                                                                className='absolute -top-2 -left-2 rounded-full bg-payzone-gold px-2 py-0.5 text-xs font-semibold text-payzone-navy shadow-sm transition duration-300 ease-in-out group-hover:bg-[#b8873d]'
                                                                        >
                                                                                {cart.length}
                                                                        </span>
                                                                )}
                                                        </Link>
                                                )}
                                                {isAdmin && (
                                                        <Link
                                                                className='flex items-center rounded-md bg-payzone-indigo px-3 py-1 text-payzone-white transition duration-300 ease-in-out hover:bg-[#3b3ad6]'
                                                                to={"/secret-dashboard"}
                                                        >
                                                                <Lock className='inline-block mr-1' size={18} />
                                                                <span className='hidden sm:inline'>Dashboard</span>
                                                        </Link>
                                                )}

                                                {user ? (
                                                        <button
                                                                className='flex items-center rounded-md bg-white/10 px-4 py-2 text-payzone-white transition duration-300 ease-in-out hover:bg-white/20'
                                                                onClick={logout}
                                                        >
                                                                <LogOut size={18} />
                                                                <span className='hidden sm:inline ml-2'>Log Out</span>
                                                        </button>
                                                ) : (
                                                        <>
                                                                <Link
                                                                        to={"/signup"}
                                                                        className='flex items-center rounded-md bg-payzone-gold px-4 py-2 font-semibold text-payzone-navy transition duration-300 ease-in-out hover:bg-[#b8873d]'
                                                                >
                                                                        <UserPlus className='mr-2' size={18} />
                                                                        Sign Up
                                                                </Link>
                                                                <Link
                                                                        to={"/login"}
                                                                        className='flex items-center rounded-md bg-payzone-indigo px-4 py-2 text-payzone-white transition duration-300 ease-in-out hover:bg-[#3b3ad6]'
                                                                >
                                                                        <LogIn className='mr-2' size={18} />
                                                                        Login
                                                                </Link>
                                                        </>
                                                )}
                                        </nav>
                                </div>
                        </div>
                </header>
        );
};
export default Navbar;
