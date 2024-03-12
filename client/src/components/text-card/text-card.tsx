/*
 * Irakur - Learn languages through immersion
 * Copyright (C) 2023-2024 Ander "Laquin" Aginaga San Sebastián
 * Licensed under version 3 of the GNU Affero General Public License
 */

const TextCard = (props: any) => {
	return (
		<div>
			<p>Title: {props.title}</p>
			<p>ID: {props.id}</p>
			<p>Language: {props.languageId}</p>
		</div>
	)
}

export { TextCard };