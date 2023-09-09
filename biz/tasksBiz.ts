import { CustomError, ResultCode, convertDateToString } from './util';
import { z } from 'zod';
import dotenv from 'dotenv';
import { getTasksByUserIdZod, getTasksByUserIdReturnZod, getTaskByIdZod, getTaskByIdReturnZod, postTaskZod, postTaskReturnZod, patchTaskZod, patchTaskReturnZod, deleteTaskZod, deleteTaskReturnZod } from './zod/tasksZod';
import Tasks from '../model/tasks';
import random from "simple-random-number-generator";
dotenv.config();

export const getTasksByUserId = async (inputs: z.infer<typeof getTasksByUserIdZod>) : Promise<z.infer<typeof getTasksByUserIdReturnZod>> => {
	const params = getTasksByUserIdZod.safeParse(inputs);
	// @ts-ignore
	if (!params.success) throw new CustomError(400, ResultCode.InvalidArgument, `Invalid parameters: ${JSON.stringify(params.error.issues)}`);

	const tasks = await Tasks.find({ user_id: inputs.user_id }).lean() ?? [];

	let result = tasks.map((task) => {
		return {
			id: task.id,
			title: task.title,
			description: task.description,
			user_id: task.user_id,
			status: task.status,
			dueDate: convertDateToString(task.dueDate),
			toURL: task.toURL,
		};
	});
	return result;
};

export const getTaskById = async (inputs: z.infer<typeof getTaskByIdZod>) : Promise<z.infer<typeof getTaskByIdReturnZod>> => {
	const params = getTaskByIdZod.safeParse(inputs);
	// @ts-ignore
	if (!params.success) throw new CustomError(400, ResultCode.InvalidArgument, `Invalid parameters: ${JSON.stringify(params.error.issues)}`);
	
	const tasks = (await Tasks.findOne({id: inputs.id})).toJSON();

	return tasks;
};

export const postTask = async (inputs: z.infer<typeof postTaskZod>) : Promise<z.infer<typeof postTaskReturnZod>> => {
	const params = postTaskZod.safeParse(inputs);
	// @ts-ignore
	if (!params.success) throw new CustomError(400, ResultCode.InvalidArgument, `Invalid parameters: ${JSON.stringify(params.error.issues)}`);
	
	const id = await random({ min: 10000000, max: 99999999, integer: true });
	const mergedInputs = {
		...inputs,
		id,
	};
	const newTask = new Tasks(mergedInputs);
	await newTask.save();

	return {
		id,
		title: newTask.title,
		description: newTask.description,
		user_id: newTask.user_id,
		status: 'Pending',
		dueDate: convertDateToString(newTask.dueDate),
		toURL: newTask.toURL,
	};
};

export const patchTask = async (inputs: z.infer<typeof patchTaskZod>) : Promise<z.infer<typeof patchTaskReturnZod>> => {
	const params = patchTaskZod.safeParse(inputs);
	// @ts-ignore
	if (!params.success) throw new CustomError(400, ResultCode.InvalidArgument, `Invalid parameters: ${JSON.stringify(params.error.issues)}`);
	const taskId = inputs.id;
	delete inputs.id;
	await Tasks.findOneAndUpdate({id: taskId}, inputs)
	const newTask = (await Tasks.findOne({id: taskId})).toJSON();

	return newTask;
};

export const deleteTask = async (inputs: z.infer<typeof deleteTaskZod>) : Promise<z.infer<typeof deleteTaskReturnZod>> => {
	const params = deleteTaskZod.safeParse(inputs);
	// @ts-ignore
	if (!params.success) throw new CustomError(400, ResultCode.InvalidArgument, `Invalid parameters: ${JSON.stringify(params.error.issues)}`);
	
	const deletedTask = (await Tasks.findOneAndDelete({id: inputs.id})).toJSON();

	return deletedTask;
};