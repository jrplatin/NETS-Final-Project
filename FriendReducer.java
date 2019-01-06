package edu.upenn.nets212.hw2;
import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;

import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.*;

import edu.upenn.nets212.FriendRecWritable;


public class FriendReducer extends Reducer<IntWritable, FriendRecWritable, IntWritable, Text> {
	@Override
	public void reduce(IntWritable key, Iterable<FriendRecWritable> values, Context context)
			throws IOException, InterruptedException {
		Map<Integer, Set<Integer>> mutuals = new HashMap<Integer, Set<Integer>>();
		Set<Integer> friends = new HashSet<Integer>();
		for (FriendRecWritable f: values) {
			int rec = f.getUser();
			int mutual = f.getMutual();
			System.out.println("source " + key + " rec " +rec + " from " + mutual);
			if (mutual != -1) {
				if (!mutuals.containsKey(rec)) {
					Set<Integer> s = new HashSet<Integer>();
					s.add(mutual);
					mutuals.put(rec, s);
				} else {
					mutuals.get(rec).add(mutual);
				}
			} else {
				friends.add(rec);
			}
		}

		String out = "";
		for (Entry<Integer, Set<Integer>> e : mutuals.entrySet()) {
			if (!friends.contains(e.getKey())) {
				out += e.getKey() + " (" + e.getValue().size() + "), ";
			}
		}
		context.write(key, new Text(out));
	}

}
