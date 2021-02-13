import React, { Component } from "react";
import "./homepage.css";
import "../forecastbench.css";
import {useState} from 'react'
class HomePage extends Component {

    render() {
    	// const [searchTerm, setSearchTerm] = useState('')
        return (
            // <div className = "Search">
            // 	<input 
            // 		type = "text" 
            // 		placeholder = "Search..." 
            // 		onChange = {(event) => {
            // 			setSearchTerm(event.target.value);
            // 		}}
            // 	/>
            // {
            	// JSONDATA.filter((val)=>{
            		//if(searchTerm == ""){
            			//return val
            		//else if (val.disease_name.toLowerCase().includes(searchTerm.toLowerCase())){
            			//return val
            		//}
            		
            		//}.map((val,key) => {
            		//return(
            		// <div className = "diseases", key = {key}>
            		//<p>{val.diseas_name}. </p>
            		//</div>
            		//);

            	
                <p>The home page is empty right now.</p>
            // }
            // </div>
        );
    }
}

export default HomePage;