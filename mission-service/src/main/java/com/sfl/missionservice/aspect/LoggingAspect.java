package com.sfl.missionservice.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
public class LoggingAspect {

    private static final Logger logger =
            LoggerFactory.getLogger(LoggingAspect.class);

    @Pointcut("execution(* com.sfl.missionservice.service.*.*(..))")
    public void serviceLayer() {
    }

    @Around("serviceLayer()")
    public Object logExecution(ProceedingJoinPoint joinPoint) throws Throwable {

        String methodName = joinPoint.getSignature().toShortString();

        logger.info("=================================================");
        logger.info("Method Started : {}", methodName);
        logger.info("Arguments      : {}", Arrays.toString(joinPoint.getArgs()));

        long start = System.currentTimeMillis();

        try {

            Object result = joinPoint.proceed();

            long end = System.currentTimeMillis();

            logger.info("Method Completed Successfully");
            logger.info("Returned       : {}", result);
            logger.info("Execution Time : {} ms", (end - start));
            logger.info("=================================================");

            return result;

        } catch (Exception ex) {

            long end = System.currentTimeMillis();

            logger.error("Exception      : {}", ex.getMessage());
            logger.info("Execution Time : {} ms", (end - start));
            logger.info("=================================================");

            throw ex;
        }
    }
}