import React, { Component } from "react";

import {
    Menu,
    Row,
    Col
} from 'antd';
import styles from "./navbar.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import {Link} from 'react-router-dom';



// class NavBar extends Component {
const NavBar = () => {
  // const handleSelect = (eventKey) => () =>{
  //     console.log(eventKey);
  // }
  function Eval(disease) {
    console.log(disease)
    // send data = covid
    // go to evaluation page 
  }
    return (
        <Navbar collapseOnSelect expand="lg" className="navbar-header navbar-light">
          <Navbar.Brand href="#/"><img
                    className="logo"
                    src="https://identity.usc.edu/files/2011/12/combo_gold_white_cardinal.png"
                    alt="USC"
                /></Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link className="navbar-link" href="#/">Home </Nav.Link>

               <NavDropdown className = "navbar-link" id = "nav-dropdown" title="Evaluation">

                   <NavDropdown.Item  href = "#/evaluation" onClick = {() => Eval('Covid')}> Covid </NavDropdown.Item>

                  <NavDropdown.Item href = "#/evaluation" onClick = {() => Eval('Influenza')} >Influenza</NavDropdown.Item>

                  <NavDropdown.Item href = "#/evaluation" onClick = {() => Eval('ChickenPox')}>ChickenPox</NavDropdown.Item>

              </NavDropdown>
              <Nav.Link className="navbar-link" href="#about">About Us</Nav.Link>
            </Nav>
            <Nav>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
    );
}


export default NavBar;