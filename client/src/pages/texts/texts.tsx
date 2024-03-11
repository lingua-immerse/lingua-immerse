/* 
 * Irakur - Learn languages through immersion
 * Copyright (C) 2023-2024 Ander "Laquin" Aginaga San Sebastián
 * Licensed under version 3 of the GNU Affero General Public License
 */

import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { backendConnector } from '../../backend-connector';
import { Loading } from '../../components/loading';
import { TextItem } from '../../components/text-item';

const Texts = () => {
	const [texts, setTexts] = useState<any | null>(null);

	const languageId = 1; // Hardcoded for now

	useEffect(() => {
		backendConnector.getTexts(languageId).then((data) => {
			setTexts(data);
		})
    }, []);

	if (!texts) {
		return <Loading />
	}
	console.log(texts);

	// Render your React components using the fetched data
	return (
		<HelmetProvider>
			<Helmet>
				<title>Irakur - Texts</title>
			</Helmet>
			<h1>Irakur - Texts</h1>
			{
			texts.map((text: any) =>(
			<React.Fragment key={text.id}>
				<TextItem title={text.title} languageId={languageId} id={text.id} />
				<br />
			</React.Fragment>
			))
			}

			<Outlet />
		</HelmetProvider>
	);
};

export { Texts };