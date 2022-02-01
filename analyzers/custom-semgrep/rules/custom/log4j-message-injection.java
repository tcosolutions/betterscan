package rules.custom.main;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class Logger1 {
    
    public void info(String str) {
        System.out.println(str);
    }

    public static void main(String[] args) {
        Logger1 logger = new Logger1();
        logger.info("str"+"ss");

    }
}

public class Main{
    Logger logger = LogManager.getLogger(Main.class.getName());
    public void main(String[] args) {
        logger.error("ss"+"ss");
    }
}