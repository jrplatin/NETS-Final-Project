import java.io.IOException;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;


public class InitMapper extends Mapper<LongWritable, Text, Text, Text> {

	public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
		String s = value.toString();
		String[] both = s.split("\t");
		context.write(new Text(both[0]), new Text(both[1]));
		if (both[1].contains("%")) {
			context.write(new Text(both[1]), new Text(both[0]));
		}
	}
}
