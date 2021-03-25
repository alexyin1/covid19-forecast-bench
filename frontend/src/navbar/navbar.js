import React, { Component } from "react";

//import {
//    Menu,
//    Row,
//    Col
//} from 'antd';
import styles from "./navbar.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import {Link} from 'react-router-dom';



// class NavBar extends Component {
class NavBar extends Component {
  // const handleSelect = (eventKey) => () =>{
  //     console.log(eventKey);
  // }
  state = {clicked: false}
  constructor(props) {
      super(props);
      this.state = {
         disease: 'default',
      }
   }

   updateData = (data) => {
      this.setState({ data });
   }
  
  handleClick = (disease) => {
    console.log(disease)
    this.setState(
      { 
        disease: disease, 
      }
      );
    // send data = covid
    // go to evaluation page 
  };

  render(){
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

               <NavDropdown id = "nav-dropdown" title="Evaluation">

                   <NavDropdown.Item>
                      <Link 
                          
                          className = "links"
                          to = {{
                            pathname: 'evaluation',
                            state: {disease: 'Covid'}
                          }}
                          > Covid 
                          </Link>

                          </NavDropdown.Item>

                  <NavDropdown.Item>  
                      <Link 
                      className = "links"
                          to = {{
                            pathname: 'evaluation',
                            state: {disease: 'Influenza'}
                          }}
                          >Influenza
                          </Link>
                          </NavDropdown.Item>

                  <NavDropdown.Item>
                      <Link 
                      className = "links"
                          to = {{
                            pathname: 'evaluation',
                            state: {disease: 'ChickenPox' }
                          }}
                          >ChickenPox
                          </Link>
                          </NavDropdown.Item>

              </NavDropdown>
              <Nav.Link className="navbar-link" href="#about">About Us</Nav.Link>
            </Nav>
            <Nav>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
    );
  }
}


export default NavBar;