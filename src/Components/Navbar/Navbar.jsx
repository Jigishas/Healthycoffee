import React from 'react'
import './Navbar.css'
import logo from '../../assets/coffee.webp'
import search from '../../assets/search-b.png'

function Navbar() {
  return (
    <div className='navbar'>
      <img src={logo} alt=""  className='logo' />

    
      <div className='search'>
      <input type="text" name="text" id="search"  placeholder='Search'/>
      <img src={search} alt="" className='search-icon' />
      </div>
    </div>
  )
}

export default Navbar;
