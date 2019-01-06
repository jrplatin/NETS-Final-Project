package edu.upenn.nets212.hw2;

import org.apache.hadoop.mapreduce.*;

import java.util.HashSet;
import java.util.Set;

import org.apache.hadoop.io.*;

import edu.upenn.nets212.Geocode;
import edu.upenn.nets212.URLGeocodeWritable;

public class GeocodeReducer extends Reducer<Text, URLGeocodeWritable, Text, Text> {

	public void reduce(Text key, Iterable<URLGeocodeWritable> values, Context context) 
			throws java.io.IOException, InterruptedException {
		Set<String> urls = new HashSet<String>();
		Set<Geocode> geocodes = new HashSet<Geocode>();
		for (URLGeocodeWritable u : values) {
			// if u has coordinates
			if (u.getGeocode().getName().equals("no url")) {
				geocodes.add(u.getGeocode());
				//System.out.println("no url");
			} else {
				// if u has a url
				urls.add(u.getGeocode().getName());
			}	
		}
		
		if (!geocodes.isEmpty()) {
			//System.out.println("not empty");
			for (Geocode g : geocodes) {
				System.out.println(g.toString());
				for (String url : urls) {
					// emit to output
					String latlon = "(" + g.getLatitude() +"," + g.getLongitude() + ")";
					String dbandURL = key.toString() + "\t" + url;
					context.write(new Text(latlon), new Text(dbandURL));
				}
			}
		}

	}
}
