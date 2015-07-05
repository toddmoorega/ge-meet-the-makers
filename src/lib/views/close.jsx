/**
 * View for Close Button
 *
 */
import { Application } from '../index';

import React from 'react';
import key from 'keymaster';

export class CloseButtonComponent extends React.Component {
    constructor(){
        super();
        this.handleCloseClick = _.bind(this.handleCloseClick, this);
        key('esc', _.bind(this.handleCloseClick, this));

    }
    componentWillMount(){

    }

    componentDidMount(){


    }
    componentWillUnmount(){

    }

    handleCloseClick(event){
        return window.location.hash = "#/timeline";

    }

    render(){
        return (
            <div onClick={this.handleCloseClick}>
                <svg version="1.1" id="closebutton"  x="0px" y="0px" viewBox="0 0 91.1 22.6" enable-background="new 0 0 91.1 22.6"  >
                <g>
                    <path d="M9.8,3.2c-2.3,0-4,0.7-5.3,2.2c-1.3,1.5-2,3.6-2,6.2c0,2.7,0.6,4.8,1.9,6.2c1.3,1.5,3,2.2,5.4,2.2c1.4,0,3.1-0.3,4.9-0.8
                        v2.1c-1.4,0.5-3.2,0.8-5.3,0.8c-3,0-5.3-0.9-7-2.7C0.8,17.5,0,14.9,0,11.5c0-2.1,0.4-4,1.2-5.5C2,4.4,3.1,3.2,4.6,2.3
                        C6.1,1.5,7.8,1,9.9,1c2.1,0,4,0.4,5.6,1.2l-1,2C12.9,3.5,11.4,3.2,9.8,3.2z"/>
                    <path d="M20.6,21.8h-2.3V0h2.3V21.8z"/>
                    <path d="M37,14.1c0,2.5-0.6,4.5-1.9,5.9c-1.3,1.4-3,2.1-5.2,2.1c-1.4,0-2.6-0.3-3.7-1c-1.1-0.6-1.9-1.6-2.5-2.8
                        c-0.6-1.2-0.9-2.6-0.9-4.2c0-2.5,0.6-4.5,1.9-5.8s3-2.1,5.2-2.1c2.1,0,3.9,0.7,5.1,2.1C36.4,9.7,37,11.7,37,14.1z M25.3,14.1
                        c0,2,0.4,3.5,1.2,4.5c0.8,1,1.9,1.5,3.5,1.5s2.7-0.5,3.5-1.5c0.8-1,1.2-2.5,1.2-4.5c0-2-0.4-3.4-1.2-4.4c-0.8-1-2-1.5-3.5-1.5
                        c-1.5,0-2.7,0.5-3.4,1.5C25.7,10.6,25.3,12.1,25.3,14.1z"/>
                    <path d="M49.9,17.6c0,1.4-0.5,2.5-1.6,3.3c-1.1,0.8-2.6,1.2-4.5,1.2c-2,0-3.6-0.3-4.8-1V19c0.7,0.4,1.5,0.7,2.4,0.9
                        c0.8,0.2,1.7,0.3,2.4,0.3c1.2,0,2.1-0.2,2.8-0.6c0.7-0.4,1-1,1-1.8c0-0.6-0.3-1.1-0.8-1.5c-0.5-0.4-1.5-0.9-3-1.5
                        c-1.4-0.5-2.4-1-3-1.4c-0.6-0.4-1.1-0.8-1.3-1.4c-0.3-0.5-0.4-1.1-0.4-1.8c0-1.3,0.5-2.2,1.5-3c1-0.7,2.4-1.1,4.2-1.1
                        c1.7,0,3.3,0.3,4.8,1l-0.8,1.9c-1.5-0.6-2.9-1-4.2-1c-1.1,0-1.9,0.2-2.5,0.5c-0.6,0.3-0.8,0.8-0.8,1.4c0,0.4,0.1,0.8,0.3,1.1
                        s0.5,0.6,1,0.8c0.5,0.3,1.4,0.6,2.7,1.1c1.8,0.7,3.1,1.3,3.7,2S49.9,16.6,49.9,17.6z"/>
                    <path d="M59,22.1c-2.3,0-4.1-0.7-5.4-2.1c-1.3-1.4-2-3.3-2-5.8c0-2.5,0.6-4.4,1.8-5.9c1.2-1.5,2.9-2.2,4.9-2.2
                        c1.9,0,3.4,0.6,4.6,1.9c1.1,1.3,1.7,2.9,1.7,5v1.5H54c0,1.8,0.5,3.2,1.4,4.1c0.9,0.9,2.1,1.4,3.6,1.4c1.7,0,3.3-0.3,4.9-1v2.1
                        c-0.8,0.4-1.6,0.6-2.3,0.8C60.9,22,60,22.1,59,22.1z M58.3,8.1c-1.2,0-2.2,0.4-2.9,1.2c-0.7,0.8-1.2,1.9-1.3,3.3h8
                        c0-1.5-0.3-2.6-1-3.4C60.5,8.5,59.6,8.1,58.3,8.1z"/>
                </g>
                <path d="M84.8,13.9L91,7.8c0.2-0.2,0.2-0.6,0-0.8l-1.6-1.6c-0.2-0.2-0.6-0.2-0.8,0l-6.1,6.1l-6.1-6.1c-0.2-0.2-0.6-0.2-0.8,0
                    l-1.6,1.6c-0.2,0.2-0.2,0.6,0,0.8l6.1,6.1L73.8,20c-0.2,0.2-0.2,0.6,0,0.8l1.6,1.6c0.2,0.2,0.6,0.2,0.8,0l6.1-6.1l6.1,6.1
                    c0.2,0.2,0.6,0.2,0.8,0l1.6-1.6c0.2-0.2,0.2-0.6,0-0.8L84.8,13.9z"/>
                </svg>
            </div>
        )
    }
}




