import React, { Component } from 'react';
import './Navbar.css';

interface NavbarProps {
    logoUrl?: string;
    title?: string;
    navItems: string[];
    isLoggedIn: boolean;
    onNavChange: (section: string) => void;
    onLogout: () => void
}


class Navbar extends Component<NavbarProps, {}> {
    constructor(props: NavbarProps) {
        super(props);
    }

    handleLoginClick = () => {
        this.props.onNavChange('login');
    };

    handleLogoutClick = () => {
        this.props.onLogout();
        this.props.onNavChange('login');
    };
    
    handleNavClick = (event: React.MouseEvent, section: string) => {
        event.preventDefault();
        this.props.onNavChange(section);
    };

    render() {
        const { logoUrl, title, navItems, isLoggedIn } = this.props;

        return (
            <header className="navbar">
                <div className="navbar-left">
                    <a href="#home" className="logo" onClick={(e) => this.handleNavClick(e, 'home')}>
                        <img
                            src={logoUrl || 'https://via.placeholder.com/75'}
                            alt="Logo"
                            className="logo-image"
                        />
                        <span className="app-name">{title || 'Title'}</span>
                    </a>
                </div>
                <nav className="navbar-center">
                    {/* Dynamically render nav items */}
                    {navItems.map((item) => (
                        <a
                            key={item}
                            href={`#${item}`}
                            onClick={(e) => this.handleNavClick(e, item)}
                        >
                            {item}
                        </a>
                    ))}
                </nav>
                <div className="navbar-right">
                    {isLoggedIn ? (
                        <>
                            <button className="nav-button" onClick={(e) => this.handleNavClick(e, 'account')}>Account</button>
                            <button className="nav-button logout" onClick={this.handleLogoutClick}>Logout</button>
                        </>
                    ) : (
                        <>
                            <button className="nav-button" onClick={(e) => this.handleNavClick(e, 'login')}>Login</button>
                            <button className="nav-button sign-up" onClick={(e) => this.handleNavClick(e, 'signup')}>Sign Up</button>
                        </>
                    )}
                </div>
            </header>
        );
    }
}

export default Navbar;
