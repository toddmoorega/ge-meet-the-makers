/**
 * View for the header Filters on the timeline primarily
 *
 */
import { Application } from '../index';

import React from 'react';

export class FilterButtonComponent extends React.Component {

    constructor(){
        super();
        this.state = {};
    }

    render(){
        return (
			<button id="filterTrigger" className="filter-trigger">
			    <svg viewBox="0 0 54 35.8">
			        <path d="M35.9 30.2h-4.5c-0.4 0-0.8 0.3-0.8 0.8 0 0.4 0.3 0.8 0.8 0.8h2.5c-2 1.2-4.4 2-6.9 2 -4.9 0-9.2-2.7-11.6-6.7C19 27.5 23 27.7 27 27.7c4 0 7.9-0.3 11.6-0.8C37.9 28.1 37 29.2 35.9 30.2zM13.6 21.7H18c0.4 0 0.8-0.3 0.8-0.8 0-0.4-0.3-0.8-0.8-0.8h-4.5c0-1.2 0.2-2.3 0.4-3.4h17.4c0.4 0 0.8-0.3 0.8-0.8 0-0.4-0.3-0.8-0.8-0.8H14.5c0.5-1.4 1.3-2.6 2.2-3.8 0 0 0 0 0 0h20.6c0.9 1.1 1.7 2.4 2.2 3.8h-4.6c-0.4 0-0.8 0.3-0.8 0.8 0 0.4 0.3 0.8 0.8 0.8h5c0 0 0 0 0 0 0.3 1.1 0.4 2.2 0.4 3.4 0 1.5-0.2 2.9-0.7 4.2 -3.6 0.6-7.9 1-12.8 1 -4.9 0-9.2-0.4-12.8-1C13.9 23.5 13.7 22.6 13.6 21.7zM35.8 10H18.2C20.5 8 23.6 6.7 27 6.7 30.4 6.7 33.4 8 35.8 10zM54 19.2c0-2.7-3.2-4.9-9.2-6.5 -0.6-0.2-1.3 0.2-1.4 0.8 -0.2 0.6 0.2 1.3 0.8 1.4 5.1 1.3 7.4 3.1 7.4 4.2 0 1.5-3.4 3.4-9.4 4.7 0.3-1.2 0.5-2.5 0.5-3.8 0-8.7-7-15.7-15.7-15.7 -8.7 0-15.7 7-15.7 15.7 0 1.3 0.2 2.6 0.5 3.8 -6-1.3-9.4-3.2-9.4-4.7 0-1.2 2.3-2.9 7.6-4.3 0.6-0.2 1-0.8 0.9-1.4 -0.2-0.6-0.8-1-1.4-0.9C3.2 14.3 0 16.5 0 19.2c0 3.5 5.4 5.9 12.7 7.3 2.4 5.5 7.9 9.3 14.3 9.3 6.4 0 11.9-3.8 14.3-9.3C48.6 25.2 54 22.7 54 19.2z" />
			        <path d="M43.9 2.4c1.2 0 2.1 1 2.1 2.1 0 1.2-1 2.1-2.1 2.1 -1.2 0-2.1-1-2.1-2.1C41.8 3.3 42.7 2.4 43.9 2.4zM43.9 9c2.5 0 4.5-2 4.5-4.5 0-2.5-2-4.5-4.5-4.5 -2.5 0-4.5 2-4.5 4.5C39.4 7 41.4 9 43.9 9z" />
			        <path d="M37.2 21.7c0.4 0 0.8-0.3 0.8-0.8 0-0.4-0.3-0.8-0.8-0.8H27.1c-0.4 0-0.8 0.3-0.8 0.8 0 0.4 0.3 0.8 0.8 0.8H37.2z" />
			    </svg>
			</button>
        )
    }
}