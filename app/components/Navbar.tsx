import { SignOutButton, useUser } from "@clerk/react-router"
import { Link } from "react-router"

const Navbar = () => {
  const { user, isLoaded, isSignedIn } = useUser();

  return (
    <nav className="navbar">
      <Link to="/">
        <p className="text-2xl font-bold text-gradient">Resume Scorer</p>
      </Link>
      
      <div className="flex flex-row gap-8">
        {isSignedIn && (
          <SignOutButton />
        )}

        <Link to="/upload" className="primary-button w-fit">
          Upload Resume
        </Link>
      </div>
    </nav>
  )
}

export default Navbar