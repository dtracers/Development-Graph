package utilities;

public class SaveException extends Exception {

	public SaveException(String string) {
		super(string);
	}

	public SaveException(Exception e) {
		super(e);
	}

	public SaveException(String string, Exception e) {
		super(string, e);
	}

}
