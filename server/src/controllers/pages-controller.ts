/*
 * Irakur - Learn languages through immersion
 * Copyright (C) 2023-2024 Ander "Laquin" Aginaga San Sebastián
 * Licensed under version 3 of the GNU Affero General Public License
 */

import { Page, ReducedWordData, Word } from "@common/types";
import { itemizeString } from "../../../common/utils";
import { databaseManager } from "../database/database-manager";
import { queries } from "../database/queries";

class PagesController
{
	async getAllPages(textId: number): Promise<Page[]>
	{
		const pages: Page[] = await databaseManager.executeQuery(
			queries.getAllPages,
			[textId]
		);

		return pages;
	}

	async getPage(textId: number, pageId: number): Promise<Page>
	{
		const page: Page = await databaseManager.getFirstRow(
			queries.getPage,
			[textId, pageId]
		);

		return page;
	}

	async editPage(textId: number, index: number, content: string, pageId: number): Promise<void>
	{
		const queryParams: any[] = [];
		const updates: string[] = [];

		if (content !== undefined)
		{
			updates.push('content = ?');
			queryParams.push(content);
		}
		
		if (updates.length > 0)
		{
			queryParams.push(textId);
			queryParams.push(pageId);

			const dynamicQuery: string = queries.editPage.replace(
				/\%DYNAMIC\%/,
				(): string => {
					return updates.join(', ');
				}
			);

			await databaseManager.executeQuery(dynamicQuery, queryParams);
		}
	}

	async getWords(textId: number, pageId: number): Promise<ReducedWordData[]>
	{
		const page: Page = await databaseManager.getFirstRow(
			queries.getPage,
			[textId, pageId]
		);

		const languageId: number = (await databaseManager.getFirstRow(
			queries.getText,
			[page.textId]
		)).languageId;

		const items: string[] = itemizeString(page.content);
		
		const dynamicQuery: string = queries.findWordsInBatch.replace(
			/\%DYNAMIC\%/,
			(): string => {
				return items.map((item: string): string => {
					return `('${item.replace(/'/g, "''")}')`;
				}).join(', ');
			}
		);
		
		const wordData: ReducedWordData[] = await databaseManager.executeQuery(
			dynamicQuery,
			[languageId, languageId]
		);

		for (let i = 0; i < wordData.length; i++)
		{
			if (wordData[i].potentialMultiword)
			{
				const potentialMultiwords: Word[] = await databaseManager.executeQuery(
					queries.getPotentialMultiwords,
					[wordData[i].content, languageId]
				);

				let multiword: Word | null = null;
				let itemCount: number | null = null;
				let items: ReducedWordData[] | null = null;

				for (const potentialMultiword of potentialMultiwords)
				{
					itemCount = potentialMultiword.itemCount;

					items = wordData.slice(i, i + itemCount);
					const itemsContent: string = items.map((item: ReducedWordData): string => {
						return item.content;
					}).join('');

					if (itemsContent === potentialMultiword.content)
					{
						multiword = potentialMultiword;
						break;
					}
				}

				if(multiword)
				{
					wordData.splice(i, multiword.itemCount, {
						content: multiword.content,
						status: multiword.status,
						type: "multiword",
						items: items!,
						potentialMultiword: undefined,
						index: -1
					});

					i += multiword.itemCount - 1;
				}
			}

			wordData[i].potentialMultiword = undefined;
		}

		this.addIndexesToWordData(wordData, 0);

		return wordData;
	}

	addIndexesToWordData(wordData: ReducedWordData[], startIndex: number): void
	{
		for (let i = 0; i < wordData.length; i++)
		{
			wordData[i].index = i+startIndex;
			if(wordData[i].type === "multiword")
			{
				this.addIndexesToWordData(wordData[i].items!, wordData[i].index+1);
				startIndex += wordData[i].items!.length;
			}
		}
	}
	
	isWord(item: string): boolean
	{
		return (item.match(/[ :;,.¿?¡!()\[\]{}\s'"\-=。、！？：；「」『』（）…＝・’“”—\d]/u) === null);
	}
}

export { PagesController };

