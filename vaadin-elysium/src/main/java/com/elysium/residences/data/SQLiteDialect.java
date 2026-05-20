package com.elysium.residences.data;

import org.hibernate.dialect.Dialect;
import org.hibernate.dialect.function.StandardSQLFunction;
import org.hibernate.type.StandardBasicTypes;

import java.sql.Types;

/**
 * Custom Hibernate 5 dialect for SQLite databases.
 * Configures type mappings and capabilities specifically for SQLite JDBC driver.
 */
public class SQLiteDialect extends Dialect {

    public SQLiteDialect() {
        super();
        registerColumnType(Types.BIT, "boolean");
        registerColumnType(Types.TINYINT, "tinyint");
        registerColumnType(Types.SMALLINT, "smallint");
        registerColumnType(Types.INTEGER, "integer");
        registerColumnType(Types.BIGINT, "integer");
        registerColumnType(Types.FLOAT, "float");
        registerColumnType(Types.REAL, "real");
        registerColumnType(Types.DOUBLE, "double");
        registerColumnType(Types.NUMERIC, "numeric");
        registerColumnType(Types.DECIMAL, "decimal");
        registerColumnType(Types.CHAR, "char");
        registerColumnType(Types.VARCHAR, "varchar");
        registerColumnType(Types.LONGVARCHAR, "longvarchar");
        registerColumnType(Types.DATE, "date");
        registerColumnType(Types.TIME, "time");
        registerColumnType(Types.TIMESTAMP, "timestamp");
        registerColumnType(Types.BINARY, "blob");
        registerColumnType(Types.VARBINARY, "blob");
        registerColumnType(Types.LONGVARBINARY, "blob");
        registerColumnType(Types.BLOB, "blob");
        registerColumnType(Types.CLOB, "clob");
        registerColumnType(Types.BOOLEAN, "boolean");

        registerFunction("concat", new StandardSQLFunction("concat", StandardBasicTypes.STRING));
        registerFunction("substring", new StandardSQLFunction("substring", StandardBasicTypes.STRING));
        registerFunction("trim", new StandardSQLFunction("trim", StandardBasicTypes.STRING));
    }

    @Override
    public org.hibernate.dialect.identity.IdentityColumnSupport getIdentityColumnSupport() {
        return new org.hibernate.dialect.identity.IdentityColumnSupportImpl() {
            @Override
            public boolean supportsIdentityColumns() {
                return true;
            }

            @Override
            public String getIdentitySelectString(String table, String column, int type) {
                return "select last_insert_rowid()";
            }

            @Override
            public String getIdentityColumnString(int type) {
                return "";
            }
        };
    }

    @Override
    public boolean supportsLimit() {
        return true;
    }

    @Override
    public String getLimitString(String query, boolean hasOffset) {
        return query + (hasOffset ? " limit ? offset ?" : " limit ?");
    }

    @Override
    public boolean supportsCurrentTimestampSelection() {
        return true;
    }

    @Override
    public boolean isCurrentTimestampSelectStringCallable() {
        return false;
    }

    @Override
    public String getCurrentTimestampSelectString() {
        return "select current_timestamp";
    }
}
