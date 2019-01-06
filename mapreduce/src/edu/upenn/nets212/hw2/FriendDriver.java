package edu.upenn.nets212.hw2;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import edu.upenn.nets212.FriendRecWritable;


public class FriendDriver {
	
	  public static void main(String[] args) throws Exception {
		  
		    if (args.length != 2) {
		      System.err.println("Usage: FriendDriver <input path> <output path>");
		      System.exit(-1);
		    }
		    
		    Job job = Job.getInstance(new Configuration(), "Friend Rec");
		    job.setJarByClass(FriendDriver.class);

		    // Set the paths to the input and output directory
		    job.setMapperClass(FriendMapper.class);
		    job.setReducerClass(FriendReducer.class);
		    job.setMapOutputKeyClass(IntWritable.class);
		    job.setMapOutputValueClass(FriendRecWritable.class);
		    
		    // Set the output types of the Reducer class
		    job.setOutputKeyClass(IntWritable.class);
		    job.setOutputValueClass(Text.class);

		    FileInputFormat.addInputPath(job, new Path(args[0]));
		    FileOutputFormat.setOutputPath(job, new Path(args[1]));
		    System.out.println("Benjamin Robinov (brobinov)");
		    System.exit(job.waitForCompletion(true) ? 0 : 1);
			
		  }

}
