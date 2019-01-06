import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URI;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FileStatus;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;


public class AdDriver {
public static void main(String[] args) throws Exception { 
		//assign command line arguments to variables
		System.out.println("Benjamin Robinov (brobinov)");

		// run the composite function
		switch (args[0]) {
			case "init": 
				deleteDirectory(args[2]);
				runInit(args[1], args[2], Integer.parseInt(args[3]));
				break;
			case "iter":
				deleteDirectory(args[2]);
				runIter(args[1], args[2], Integer.parseInt(args[3]));
				break;
			case "diff": 
				deleteDirectory("mid");
				deleteDirectory(args[3]);
				//runDiff(args[1], args[2], args[3], Integer.parseInt(args[4]));
				break;
			case "finish":
				deleteDirectory(args[2]);
				runFinish(args[1], args[2], Integer.parseInt(args[3]));
				break;
			case "composite":
				deleteDirectory(args[2]);
				deleteDirectory(args[3]);
				deleteDirectory(args[4]);
				deleteDirectory(args[5]);
				composite(args[1], args[2], args[3], args[4],
						 Integer.parseInt(args[5]));
				break;
			default:
				System.out.println("Command not recognized");
		}
	}
	
	static void composite(String input, String output, String mid1, String mid2,
			 int numReducers) throws Exception {
		runInit(input, mid1, numReducers);
		
		for (int i = 0; i < 8; i++) {
			runIter(mid1, mid2, numReducers);
			deleteDirectory(mid1);
			runIter(mid2, mid1, numReducers);
			deleteDirectory(mid2);
		}
		runFinish(mid1, output, numReducers);
	}
	
	static void runFinish(String input, String output, int numReducers) throws Exception {
		Job finishJob = Job.getInstance(new Configuration(), "HW3 Finish");
		finishJob.setJarByClass(AdDriver.class);
		finishJob.setNumReduceTasks(numReducers);

		// Set the paths to the input and output directory
		finishJob.setMapperClass(FinishMapper.class);
		finishJob.setReducerClass(FinishReducer.class);
		finishJob.setMapOutputKeyClass(Text.class);
		finishJob.setMapOutputValueClass(Text.class);

		// Set the output types of the Reducer class
		finishJob.setOutputKeyClass(Text.class);
		finishJob.setOutputValueClass(Text.class);

		FileInputFormat.addInputPath(finishJob, new Path(input));
		FileOutputFormat.setOutputPath(finishJob, new Path(output));
		System.out.println("Benjamin Robinov (brobinov)");
		System.exit(finishJob.waitForCompletion(true) ? 0 : 1);
	}
	

	
	static void runIter(String input, String output, int numReducers) throws Exception {
		Job iterJob = Job.getInstance(new Configuration(), "Ad Iter");
		iterJob.setJarByClass(AdDriver.class);
		iterJob.setNumReduceTasks(numReducers);

		// Set the paths to the input and output directory
		iterJob.setMapperClass(IterMapper.class);
		iterJob.setReducerClass(IterReducer.class);
		iterJob.setMapOutputKeyClass(Text.class);
		iterJob.setMapOutputValueClass(Text.class);

		// Set the output types of the Reducer class
		iterJob.setOutputKeyClass(Text.class);
		iterJob.setOutputValueClass(Text.class);

		FileInputFormat.addInputPath(iterJob, new Path(input));
		FileOutputFormat.setOutputPath(iterJob, new Path(output));
		System.out.println("Benjamin Robinov (brobinov)");
		iterJob.waitForCompletion(true);
	}
	

	static void runInit(String input, String output, int numReducers) throws Exception {
		Job initJob = Job.getInstance(new Configuration(), "Ad Init");
		initJob.setJarByClass(AdDriver.class);
		initJob.setNumReduceTasks(numReducers);

		// Set the paths to the input and output directory
		initJob.setMapperClass(InitMapper.class);
		initJob.setReducerClass(InitReducer.class);
		initJob.setMapOutputKeyClass(Text.class);
		initJob.setMapOutputValueClass(Text.class);

		// Set the output types of the Reducer class
		initJob.setOutputKeyClass(Text.class);
		initJob.setOutputValueClass(Text.class);

		FileInputFormat.addInputPath(initJob, new Path(input));
		FileOutputFormat.setOutputPath(initJob, new Path(output));
		System.out.println("Benjamin Robinov (brobinov)");
		initJob.waitForCompletion(true);
	}

	// Given an output folder, returns the first double from the first part-r-00000 file
	static double readDiffResult(String path) throws Exception 
	{
		double diffnum = 0.0;
		Path diffpath = new Path(path);
		Configuration conf = new Configuration();
		FileSystem fs = FileSystem.get(URI.create(path),conf);

		if (fs.exists(diffpath)) {
			FileStatus[] ls = fs.listStatus(diffpath);
			for (FileStatus file : ls) {
				if (file.getPath().getName().startsWith("part-r-00000")) {
					FSDataInputStream diffin = fs.open(file.getPath());
					BufferedReader d = new BufferedReader(new InputStreamReader(diffin));
					String diffcontent = d.readLine();
					diffnum = Double.parseDouble(diffcontent);
					d.close();
				}
			}
		}

		fs.close();
		return diffnum;
	}

	static void deleteDirectory(String path) throws Exception {
		Path todelete = new Path(path);
		Configuration conf = new Configuration();
		FileSystem fs = FileSystem.get(URI.create(path),conf);

		if (fs.exists(todelete)) 
			fs.delete(todelete, true);

		fs.close();
	}
}
