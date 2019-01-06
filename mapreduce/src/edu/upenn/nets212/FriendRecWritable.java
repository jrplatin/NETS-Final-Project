package edu.upenn.nets212;

import java.io.DataInput;
import java.io.DataOutput;
import java.io.IOException;

import org.apache.hadoop.io.Writable;

public class FriendRecWritable implements Writable {

	private int user;
	private int mutual;
	
	public FriendRecWritable() {
		this(-1, -1);
	}
	
	public FriendRecWritable(int u, int m) {
		user = u;
		mutual = m;	
	}
	
	public int getUser() {
		return user;
	}
	
	public int getMutual() {
		return mutual;
	}
	
	@Override
	public void readFields(DataInput in) throws IOException {
		user = in.readInt();
		mutual = in.readInt();
	}

	@Override
	public void write(DataOutput out) throws IOException {
		out.writeInt(user);
		out.writeInt(mutual);
	}

}
