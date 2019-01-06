package edu.upenn.nets212.hw2;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;

import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.io.*;


import edu.upenn.nets212.Triple;
import edu.upenn.nets212.URLGeocodeWritable;

public class GeocodeDriver {

  public static void main(String[] args) throws Exception {
  
    if (args.length != 2) {
      System.err.println("Usage: GeocodeDriver <input path> <output path>");
      System.exit(-1);
    }
    
    Job job = Job.getInstance(new Configuration(), "HW2");
    job.setJarByClass(GeocodeDriver.class);

    // Set the paths to the input and output directory
    job.setMapperClass(GeocodeMapper.class);
    job.setReducerClass(GeocodeReducer.class);
    //job.setMapOutputKeyClass(Text.class);
    //job.setMapOutputValueClass(URLGeocodeWritable.class);
    
    // Set the output types of the Reducer class
    job.setOutputKeyClass(Text.class);
    job.setOutputValueClass(URLGeocodeWritable.class);

    FileInputFormat.addInputPath(job, new Path(args[0]));
    FileOutputFormat.setOutputPath(job, new Path(args[1]));
    System.out.println("Benjamin Robinov (brobinov)");
    System.exit(job.waitForCompletion(true) ? 0 : 1);
	
  }
  
  public static Triple parseTriple(String str) {
    try {
      int subjLAngle = 0;
      int subjRAngle = str.indexOf('>');
      int predLAngle = str.indexOf('<', subjRAngle + 1);
      int predRAngle = str.indexOf('>', predLAngle + 1);
      int objLAngle = str.indexOf('<', predRAngle + 1);
      int objRAngle = str.indexOf('>', objLAngle + 1);

      if (objLAngle == -1) {
	objLAngle = str.indexOf('\"', predRAngle + 1);
	objRAngle = str.indexOf('\"', objLAngle + 1); 
      }

      String subject = str.substring(subjLAngle + 1, subjRAngle);
      String predicate = str.substring(predLAngle + 1, predRAngle);
      String object = str.substring(objLAngle + 1, objRAngle);

      return new Triple(subject, predicate, object);
    } catch(Exception e) {
      return null;
    }
  }
	
  public static Double[] parseCoordinates(String raw) {
    int space = raw.indexOf(' ');
    String latStr = raw.substring(0, space);
    String lonStr = raw.substring(space + 1);
    Double lat = Double.parseDouble(latStr);
    Double lon = Double.parseDouble(lonStr);
    if (lat == null || lon == null)
      return null;
 
    return new Double[] {lat, lon};
  }
}
