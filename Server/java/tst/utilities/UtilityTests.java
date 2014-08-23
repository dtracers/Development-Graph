package utilities;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runners.Suite.SuiteClasses;

/**
 * All classes in the suite open up a different test webpage
 * @author gigemjt
 *
 */
@RunWith(Suite.class)
@SuiteClasses({IdFirstTest.class, JsonReaderTest.class, JsonWriterTest.class, JsonInsertionTest.class, SaveManagerTest.class})
public class UtilityTests {

}
