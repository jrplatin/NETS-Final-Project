package edu.upenn.nets212.hw2;
import java.io.IOException;
import java.util.LinkedList;
import java.util.List;

import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.*;
import edu.upenn.nets212.FriendRecWritable;


public class FriendMapper extends Mapper<LongWritable, Text, IntWritable, FriendRecWritable> {

	public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
		String s = value.toString();
		String[] arr = s.split("\t"); 
		if (arr.length == 2) {
			int src = Integer.parseInt(arr[0]);
			String[] friendArr = arr[1].split(" ");
			List<Integer> friends = new LinkedList<Integer>();
			for (String f : friendArr) {
				int friend = Integer.parseInt(f);
				friends.add(friend);
				context.write(new IntWritable(src), new FriendRecWritable(friend,-1));
				System.out.println("" + src + " <-> " + friend);

			}
			
			for (int i = 0; i < friends.size(); i++) {
				for (int j = 0; j < friends.size(); j++) {
					if (i != j) {
						context.write(new IntWritable(friends.get(i)), 
								new FriendRecWritable(friends.get(j), src));
						System.out.println("" + friends.get(i) + " -> " + friends.get(j) + ", from " + src );

					}
				}
			}
		}
	}
}
