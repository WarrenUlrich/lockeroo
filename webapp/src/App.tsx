import React, { Component } from 'react';
import Navbar from './components/Navbar';
import LoginBox from './components/LoginBox';
import RegisterBox from './components/RegisterBox';

interface AppState {
  currentNav: string;
  isLoggedIn: boolean;
}

class App extends Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      currentNav: 'Home',
      isLoggedIn: false,
    };
  }

  async componentDidMount() {
    await this.checkAuthed();
  }

  handleNavChange = (section: string) => {
    this.setState({ currentNav: section });
  };

  handleLogout = async () => {
    try {
      await fetch('/auth/logout', { method: 'POST' });
      this.setState({ isLoggedIn: false });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  handleLogin = async (username: string, password: string) => {
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Login failed:', data.error);
        return false;
      }

      this.setState({ isLoggedIn: true });
      this.handleNavChange('account');
      return true;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  handleSignup = async (email: string, username: string, password: string) => {
    try {
      const response = await fetch('/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Registration failed:', data.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error during registration:', error);
      return false;
    }
  };

  checkAuthed = async () => {
    try {
      const response = await fetch('/auth/status', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        this.setState({ isLoggedIn: true });
      } else {
        this.setState({ isLoggedIn: false });
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
      this.setState({ isLoggedIn: false });
    }
  };

  render() {
    const navItems = ['About', 'Support'];
    const { currentNav, isLoggedIn } = this.state;

    return (
      <div>
        <Navbar
          title="Lockeroo"
          navItems={navItems}
          isLoggedIn={isLoggedIn}
          onNavChange={this.handleNavChange}
          onLogout={this.handleLogout}
        />
        <div>
          {currentNav === 'home' && (
            <div>
              <p>Home</p>
            </div>
          )}
          {currentNav === 'About' && (
            <div>
              <p>About</p>
            </div>
          )}
          {currentNav === 'Support' && (
            <div>
              <p>Support</p>
            </div>
          )}
          {currentNav === 'login' && (
            <LoginBox onLogin={(username, password) => this.handleLogin(username, password)} />
          )}
          {currentNav === 'signup' && (
            <RegisterBox onRegister={(email, username, password) => this.handleSignup(email, username, password)} />
          )}
          {currentNav === 'account' && <p>Account</p>}
        </div>
      </div>
    );
  }
}

export default App;

